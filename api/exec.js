import { eventFetchFilter } from "../common/api_helper.js";
import {
  toHexString
} from "../common/utils.js";
import { instantiateWasm } from "../common/bundle.js";

/**
 * Execute the given zkgraph {$wasmPath, $yamlPath} in the context of $blockid
 * @param {string} basePath 
 * @param {string} wasmPath 
 * @param {string} yamlPath 
 * @param {string} rpcUrl 
 * @param {number | string} blockid 
 * @param {boolean} isLocal 
 * @param {boolean} enableLog 
 * @returns {Uint8Array} - execution result (aka. zkgraph state)
 */
export async function execute(basePath, wasmPath, yamlPath, rpcUrl, blockid, isLocal=false, enableLog=true) {

    // Fetch receipts and filter
    const [rawReceipts, matchedEventOffsets] = await eventFetchFilter(yamlPath, rpcUrl, blockid, enableLog)
  
    let asmain_exported;
    if (isLocal) {
      const { asmain } = await instantiateWasm(wasmPath, basePath);
      asmain_exported = asmain;
    } else {
      const { asmain, __as_start } = await instantiateWasm(wasmPath, basePath);
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
