import {
    formatVarLenInput,
    formatIntInput,
    formatHexStringInput,
  } from "../common/api_helper.js";
  import { getBlockByNumber, getBlockByHash, getRawReceipts } from "../common/ethers_helper.js";
  import { filterEvents } from "../common/api_helper.js";
  import {
    toHexString,
    trimPrefix,
  } from "../common/utils.js";
  import { loadZKGraphEventSources } from "../common/config_utils.js";
import { providers } from "ethers";

/**
 * Generate the private and public inputs in hex string format
 * @param {string} yamlContent
 * @param {string} rpcUrl
 * @param {number | string} blockid
 * @param {string} expectedStateStr
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {[string, string]} - private input string, public input string
 */
export async function proveInputGen(yamlContent, rpcUrl, blockid, expectedStateStr, isLocal=false, enableLog=true) {
    const provider = new providers.JsonRpcProvider(rpcUrl);

    // Get block
    let block;
    if (typeof blockid === "string" && blockid.length == 66 && blockid.charAt(0) == '0' && blockid.charAt(1) == 'x'){
        block = await getBlockByHash(provider, blockid).catch((error) => {
            throw error;
            // console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
            // process.exit(1);
            },
        );
    } else {
        block = await getBlockByNumber(provider, blockid).catch((error) => {
            throw error;
            // console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
            // process.exit(1);
            },
        );
    }

    const blockNumber = parseInt(block.number);
    const blockHash = block.hash;
    const receiptsRoot = block.receiptsRoot;

    // Fetch raw receipts
    const rawreceiptList = await getRawReceipts(provider, blockid).catch((error) => {
      throw error;
    });

    if (enableLog){
        console.log("[*] Run zkgraph on block:", blockid, '\n');
    }

    return await proveInputGenOnRawReceipts(yamlContent, rawreceiptList, blockNumber, blockHash, receiptsRoot, expectedStateStr, isLocal, enableLog)
}

export async function proveInputGenOnRawReceipts(yamlContent, rawreceiptList, blockNumber, blockHash, receiptsRoot, expectedStateStr, isLocal=false, enableLog=true) {

    expectedStateStr = trimPrefix(expectedStateStr, "0x");

    const [sourceAddressList, sourceEsigsList] = loadZKGraphEventSources(yamlContent);
    const [rawReceipts, matchedEventOffsets] = await filterEvents(sourceAddressList, sourceEsigsList, rawreceiptList, enableLog).catch((error) => {
      throw error;
    });

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


    // Generate inputs
    publicInputStr =
      formatIntInput(blockNumber) +
      formatHexStringInput(blockHash) +
      formatVarLenInput(expectedStateStr);
    privateInputStr =
      formatVarLenInput(toHexString(rawReceipts)) +
      formatHexStringInput(receiptsRoot);
  }

//   if (enableLog){
//     console.log("[+] ZKGRAPH STATE OUTPUT:", expectedStateStr, "\n");
//     console.log("[+] PRIVATE INPUT FOR ZKWASM:", "\n" + privateInputStr, "\n");
//     console.log("[+] PUBLIC INPUT FOR ZKWASM:", "\n" + publicInputStr, "\n");
//   }
  return [privateInputStr, publicInputStr]
}
