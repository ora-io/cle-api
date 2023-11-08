import {
  formatVarLenInput,
  formatIntInput,
  formatHexStringInput,
} from "../common/api_helper.js";
import {
  getBlockByNumber,
  getBlockByHash,
  getRawReceipts,
  getProof,
  getBlock,
} from "../common/ethers_helper.js";
import { filterEvents } from "../common/api_helper.js";
import { toHexString, trimPrefix } from "../common/utils.js";
import {
  loadZKGraphEventSources,
  loadZKGraphStorageSources,
  loadZKGraphType,
} from "../common/config_utils.js";
import { Input } from "../common/input.js";
import { ethers, providers } from "ethers";
import { ZkGraphYaml } from "../type/zkgyaml.js";

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
export async function proveInputGen(
  yamlContent,
  rpcUrl,
  blockid,
  expectedStateStr,
  isLocal = false,
  enableLog = true
) {
  const provider = new providers.JsonRpcProvider(rpcUrl);

  // Get block
  let block = getBlock(provider, blockid);

  const blockNumber = parseInt(block.number);
  const blockHash = block.hash;

  let graphType = loadZKGraphType(yamlContent);
  if (graphType === "event") {
    // Fetch raw receipts
    const rawreceiptList = await getRawReceipts(provider, blockid).catch(
      (error) => {
        throw error;
      }
    );

    return await proveInputGenOnRawReceipts(
      yamlContent,
      rawreceiptList,
      blockNumber,
      blockHash,
      receiptsRoot,
      expectedStateStr,
      isLocal,
      enableLog
    );
  }

  return fillExecInput(provider, yamlContent, blockNumber, blockHash, expectedStateStr);
}

export async function proveInputGenOnRawReceipts(
  yamlContent,
  rawreceiptList,
  blockNumber,
  blockHash,
  receiptsRoot,
  expectedStateStr,
  isLocal = false,
  enableLog = true
) {
  expectedStateStr = trimPrefix(expectedStateStr, "0x");

  const [eventDSAddrList, eventDSEsigsList] =
    loadZKGraphEventSources(yamlContent);
  const [rawReceipts, matchedEventOffsets] = await filterEvents(
    eventDSAddrList,
    eventDSEsigsList,
    rawreceiptList,
    enableLog
  ).catch((error) => {
    throw error;
  });

  // Declare inputs
  let privateInputStr, publicInputStr;

  // Set value for inputs
  if (isLocal) {
    // Generate inputs
    privateInputStr =
      formatVarLenInput(toHexString(rawReceipts)) +
      formatVarLenInput(
        toHexString(new Uint8Array(matchedEventOffsets.buffer))
      );
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
  return [privateInputStr, publicInputStr];
}

export async function fillProveInput(
  provider,
  yamlContent,
  blockNumber,
  blockHash,
  expectedStateStr
) {
  expectedStateStr = trimPrefix(expectedStateStr, "0x");
  let input = fillExecInput(
    provider,
    yamlContent,
    blockNumber
  )

  // Public: blockhash_latest
  input.addHexString(blockHash, true);

  // for test
  // if (i === 0) {
  //   expectedStateStr = ethproof.storageProof[0].value;
  // }
  // Public: expected_state
  input.addVarLenHexString(expectedStateStr, true);

  return input;
}