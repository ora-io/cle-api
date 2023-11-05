import { filterEvents } from "../common/api_helper.js";
import {
  toHexString
} from "../common/utils.js";
import { instantiateWasm } from "../common/bundle.js";
import { providers } from "ethers";
import { getRawReceipts } from "../common/ethers_helper.js";
import { loadZKGraphSources } from "../common/config_utils.js";

/**
 * Execute the given zkgraph {$wasmUnit8Array, $yamlContent} in the context of $blockid
 * @param {string} wasmUnit8Array
 * @param {string} yamlContent
 * @param {string} rpcUrl
 * @param {number | string} blockid
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {Uint8Array} - execution result (aka. zkgraph state)
 */
export async function execute(wasmUnit8Array, yamlContent, rpcUrl, blockid, isLocal=false, enableLog=true) {

    const provider = new providers.JsonRpcProvider(rpcUrl);

    // Fetch raw receipts
    const rawreceiptList = await getRawReceipts(provider, blockid).catch((error) => {
      throw error;
    })

    if (enableLog){
        console.log(`[*] Run zkgraph on block ${blockid}\n`);
    }

    return await executeOnRawReceipts(wasmUnit8Array, yamlContent, rawreceiptList, isLocal, enableLog)
}

/**
 * Execute the given zkgraph {$wasmUnit8Array, $yamlContent} in the context of $blockid
 * @param {string} wasmUnit8Array
 * @param {string} yamlContent
 * @param {Array<string>} rawreceiptList
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {Uint8Array} - execution result (aka. zkgraph state)
 */
export async function executeOnRawReceipts(wasmUnit8Array, yamlContent, rawreceiptList, isLocal=false, enableLog=true) {

    const [sourceAddressList, sourceEsigsList] = loadZKGraphSources(yamlContent);
    // Fetch receipts and filter
    const [rawReceipts, matchedEventOffsets] = await filterEvents(sourceAddressList, sourceEsigsList, rawreceiptList, enableLog).catch((error) => {
      throw error;
    })

    let asmain_exported;
    if (isLocal) {
      const { asmain, local_run } = await instantiateWasm(wasmUnit8Array).catch((error) => {
        throw error
      });
      local_run()
      asmain_exported = asmain;
    } else {
      const { asmain, __as_start, full_run } = await instantiateWasm(wasmUnit8Array).catch((error) => {
        throw error
      });
      full_run()
      asmain_exported = asmain;
      __as_start();
    }

    // Execute zkgraph that would call mapping.ts
    let stateU8a = asmain_exported(rawReceipts, matchedEventOffsets);

    if (enableLog) {
        console.log("[+] ZKGRAPH STATE OUTPUT:", toHexString(stateU8a), "\n");
    }

    return stateU8a
}
