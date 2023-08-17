import {
    formatVarLenInput,
    formatIntInput,
    formatHexStringInput,
    genStreamAndMatchedEventOffsets,
  } from "../common/api_helper.js";
  import { loadZKGraphConfig } from "../common/config_utils.js";
  import { providers } from "ethers";
  import { getRawReceipts, getBlockByNumber } from "../common/ethers_helper.js";
  import { rlpDecodeAndEventFilter } from "../common/api_helper.js";
  import {
    fromHexString,
    toHexString,
    toHexStringBytes32Reverse,
    trimPrefix,
  } from "../common/utils.js";
  import { currentNpmScriptName, logDivider, logLoadingAnimation, logReceiptAndEvents } from "../common/log_utils.js";
  
/**
 * Generate the private and public inputs in hex string format
 * @param {string} yamlPath 
 * @param {string} rpcUrl 
 * @param {number | string} blockid 
 * @param {string} expectedStateStr 
 * @param {boolean} isLocal 
 * @param {boolean} enableLog 
 * @returns 
 */
export async function proveInputGen(yamlPath, rpcUrl, blockid, expectedStateStr, isLocal=false, enableLog=true) {

    expectedStateStr = trimPrefix(expectedStateStr, "0x");
    
  // Read block id
  if (typeof blockid === "string"){
    blockid = blockid.length >= 64 ? blockid : parseInt(blockid) //e.g. 17633573
  }
  
  // Load config
  const [source_address, source_esigs] = loadZKGraphConfig(yamlPath);
  
  const provider = new providers.JsonRpcProvider(rpcUrl);
  
  // Fetch raw receipts
  let rawreceiptList = await getRawReceipts(provider, blockid);
  
  // RLP Decode and Filter
  const [filteredRawReceiptList, filteredEventList] = rlpDecodeAndEventFilter(
    rawreceiptList,
    fromHexString(source_address),
    source_esigs.map((esig) => fromHexString(esig)),
  );
  
  // Gen Offsets
  let [rawReceipts, matchedEventOffsets] = genStreamAndMatchedEventOffsets(
    filteredRawReceiptList,
    filteredEventList,
  );
  

  if (enableLog){
      // Log receipt number from block, and filtered events
      logReceiptAndEvents(
        rawreceiptList,
        blockid,
        matchedEventOffsets,
        filteredEventList,
      );
  }
  
  // may remove
  matchedEventOffsets = Uint32Array.from(matchedEventOffsets);
  
  // Declare inputs
  let privateInputStr, publicInputStr;
  
  // Set value for inputs
  if (isLocal) {
    // Generate inputs
    privateInputStr =
      formatVarLenInput(toHexString(rawReceipts)) +
      formatVarLenInput(toHexString(new Uint8Array(matchedEventOffsets.buffer)));
    publicInputStr = formatVarLenInput(expectedStateStr);
  } else {
  
    // Get block
    const simpleblock = await provider.getBlock(blockid).catch(() => {
      console.err("[-] ERROR: Failed to getBlock()", "\n");
      process.exit(1);
    });
    const block = await getBlockByNumber(provider, simpleblock.number).catch(
      () => {
        console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
        process.exit(1);
      },
    );

    // Generate inputs
    publicInputStr =
      formatIntInput(parseInt(block.number)) +
      formatHexStringInput(block.hash) +
      formatVarLenInput(expectedStateStr);
    privateInputStr =
      formatVarLenInput(toHexString(rawReceipts)) +
      formatHexStringInput(block.receiptsRoot);
  }

  if (enableLog){
    console.log("[+] ZKGRAPH STATE OUTPUT:", expectedStateStr, "\n");
    console.log("[+] PRIVATE INPUT FOR ZKWASM:", "\n" + privateInputStr, "\n");
    console.log("[+] PUBLIC INPUT FOR ZKWASM:", "\n" + publicInputStr, "\n");
  }
  return [privateInputStr, publicInputStr]
}
