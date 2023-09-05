import { filterEvents } from "../common/api_helper.js";
import {
  toHexString
} from "../common/utils.js";
import { instantiateWasm } from "../common/bundle.js";
import { providers } from "ethers";
import { getRawReceipts } from "../common/ethers_helper.js";

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

    const provider = new providers.JsonRpcProvider(rpcUrl);

    // Fetch raw receipts
    const rawreceiptList = await getRawReceipts(provider, blockid);

    if (enableLog){
        console.log(`[*] Run zkgraph on block ${blockid}\n`);
    }
    
    return await executeOnRawReceipts(basePath, wasmPath, yamlPath, rawreceiptList, isLocal, enableLog)
}

/**
 * Execute the given zkgraph {$wasmPath, $yamlPath} in the context of $blockid
 * @param {string} basePath 
 * @param {string} wasmPath 
 * @param {string} yamlPath 
 * @param {Array<string>} rawreceiptList 
 * @param {boolean} isLocal 
 * @param {boolean} enableLog 
 * @returns {Uint8Array} - execution result (aka. zkgraph state)
 */
export async function executeOnRawReceipts(basePath, wasmPath, yamlPath, rawreceiptList, isLocal=false, enableLog=true) {

    // Fetch receipts and filter
    const [rawReceipts, matchedEventOffsets] = await filterEvents(yamlPath, rawreceiptList, enableLog)
  
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