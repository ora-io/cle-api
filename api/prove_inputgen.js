import {
    formatVarLenInput,
    formatIntInput,
    formatHexStringInput,
  } from "../common/api_helper.js";
  import { getBlockByNumber, getRawReceipts } from "../common/ethers_helper.js";
  import { filterEvents } from "../common/api_helper.js";
  import {
    toHexString,
    trimPrefix,
  } from "../common/utils.js";
import { providers } from "ethers";

/**
 * Generate the private and public inputs in hex string format
 * @param {string} yamlPath
 * @param {string} rpcUrl
 * @param {number | string} blockid
 * @param {string} expectedStateStr
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {[string, string]} - private input string, public input string
 */
export async function proveInputGen(yamlPath, rpcUrl, blockid, expectedStateStr, isLocal=false, enableLog=true) {
    const provider = new providers.JsonRpcProvider(rpcUrl);

    // Fetch raw receipts
    const rawreceiptList = await getRawReceipts(provider, blockid).catch((error) => {
      throw error;
    });

    if (enableLog){
        console.log("[*] Run zkgraph on block:", blockid, '\n');
    }

    // Get block
    const simpleblock = await provider.getBlock(blockid).catch((error) => {
        throw error;
        // console.err("[-] ERROR: Failed to getBlock()", "\n");
        // process.exit(1);
      });
      const block = await getBlockByNumber(provider, simpleblock.number).catch((error) => {
        throw error;
        // console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
        // process.exit(1);
        },
      );
    const blockNumber = parseInt(block.number);
    const blockHash = block.hash;
    const receiptsRoot = block.receiptsRoot;

    return await proveInputGenOnRawReceipts(yamlPath, rawreceiptList, blockNumber, blockHash, receiptsRoot, expectedStateStr, isLocal, enableLog)
}

export async function proveInputGenOnRawReceipts(yamlPath, rawreceiptList, blockNumber, blockHash, receiptsRoot, expectedStateStr, isLocal=false, enableLog=true) {

    expectedStateStr = trimPrefix(expectedStateStr, "0x");

    const [rawReceipts, matchedEventOffsets] = await filterEvents(yamlPath, rawreceiptList, enableLog).catch((error) => {
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
