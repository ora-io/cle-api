import { filterEvents } from "../common/api_helper.js";
import {
  toHexString
} from "../common/utils.js";
import { proveInputGen } from "./prove_inputgen.js";
import { ZKWASMMock } from "../common/zkwasm_mock.js";
import { instantiateWasm, setupZKWasmMock } from "../common/bundle.js";
import { providers } from "ethers";
import { getRawReceipts } from "../common/ethers_helper.js";
import { loadZKGraphEventSources, loadZKGraphType } from "../common/config_utils.js";

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

    if (enableLog){
        console.log(`[*] Run zkgraph on block ${blockid}\n`);
    }

    let graphType = loadZKGraphType(yamlContent);
    if (graphType === "event") {
      // Fetch raw receipts
      const rawreceiptList = await getRawReceipts(provider, blockid).catch((error) => {
        throw error;
      })
      return await executeOnRawReceipts(wasmUnit8Array, yamlContent, rawreceiptList, isLocal, enableLog)
    }

  
    let [privateInputStr, publicInputStr] = await proveInputGen(yamlContent, rpcUrl, blockid, "0x0", isLocal, enableLog);
    console.log(privateInputStr)
    console.log(publicInputStr)
    return await executeOnStorages(wasmUnit8Array, privateInputStr, publicInputStr)
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

    const [sourceAddressList, sourceEsigsList] = loadZKGraphEventSources(yamlContent);
    // Fetch receipts and filter
    const [rawReceipts, matchedEventOffsets] = await filterEvents(sourceAddressList, sourceEsigsList, rawreceiptList, enableLog).catch((error) => {
      throw error;
    })

    let asmain_exported;
    if (isLocal) {
      const { asmain } = await instantiateWasm(wasmUnit8Array).catch((error) => {
        throw error
      });
      asmain_exported = asmain;
    } else {
      const { asmain, __as_start } = await instantiateWasm(wasmUnit8Array).catch((error) => {
        throw error
      });
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

export async function executeOnStorages(wasmUnit8Array, privateInputStr, publicInputStr) {
  const mock = new ZKWASMMock();
  mock.set_private_input(privateInputStr);
  mock.set_public_input(publicInputStr);
  setupZKWasmMock(mock);

  const { asmain } = await instantiateWasm(wasmUnit8Array).catch((error) => {
      throw error
  });

  let stateU8a;
  try {
      stateU8a = asmain();
  } catch (e){
      throw e
  }

  return stateU8a;
}