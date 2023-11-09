import { filterEvents } from "../common/api_helper.js";
import {
  toHexString
} from "../common/utils.js";
import { proveInputGen } from "./prove_inputgen.js";
import { ZKWASMMock } from "../common/zkwasm_mock.js";
import { instantiateWasm, setupZKWasmMock } from "../common/bundle.js";
import { loadZKGraphEventSources, loadZKGraphType } from "../common/config_utils.js";
import { ZkGraphYaml } from "../type/zkgyaml.js";
// import { execInputGen, execInputGenOnBlockPrepMap } from "./exec_inputgen.js";
import { Input } from "../common/input.js";
import { BlockPrep } from "../dsp/ethereum/blockprep.js";
import { DSPHub, hubGetDSPByYaml } from "../dsp/hub.js";

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
export async function execute(wasmUnit8Array, yamlContent, execParams, isLocal=false, enableLog=true) {

  // TODO: mv this log to cli
    // if (enableLog){
    //     console.log(`[*] Run zkgraph on block ${blockid}\n`);
    // }
    let zkgyaml = ZkGraphYaml.fromYamlContent(yamlContent)
    
    let dsp /**:DataSourcePlugin */ = hubGetDSPByYaml(zkgyaml, {'isLocal': isLocal});

    let prepareParams = await dsp.toPrepareParamsFromExecParams(execParams)
    let dataPrep /**:DataPrep */ = await dsp.prepareData(zkgyaml, prepareParams)

    return executeOnDataPrep(wasmUnit8Array, yamlContent, dataPrep)

    // console.log(privateInputStr)
    // console.log(publicInputStr)
    // return await executeOnBlockPrepMap(wasmUnit8Array, yamlContent, blockPrepMap, blocknumOrder, isLocal, enableLog)
}

export async function executeOnDataPrep(wasmUnit8Array, yamlContent, dataPrep, isLocal=false, enableLog=true) {
  let zkgyaml = ZkGraphYaml.fromYamlContent(yamlContent)

  // let [privateInputStr, publicInputStr] = execInputGenOnBlockPrepMap(zkgyaml, blockPrepMap, blocknumOrder)

  let input = new Input();

  let dsp /**:DataSourcePlugin */ = hubGetDSPByYaml(zkgyaml, {'isLocal': isLocal});

  input = dsp.fillExecInput(input, zkgyaml, dataPrep)
  
  // input = fillExecInput(input, zkgyaml, blockPrepMap, blocknumOrder)

  let [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()];

  return await executeOnInputs(wasmUnit8Array, privateInputStr, publicInputStr)
}

export async function executeOnInputs(wasmUnit8Array, privateInputStr, publicInputStr) {
  const mock = new ZKWASMMock();
  mock.set_private_input(privateInputStr);
  mock.set_public_input(publicInputStr);
  setupZKWasmMock(mock);

  const { asmain } = await instantiateWasm(wasmUnit8Array).catch((error) => {
      throw error
  });

  let stateU8a;
  try {
      // __as_start();
      stateU8a = asmain();
  } catch (e){
      throw e
  }
  return stateU8a;
}

// /**
//  * // TODO: compitable purpose
//  * // Deprecated since yaml specVersion: v0.0.2
//  * Execute the given zkgraph {$wasmUnit8Array, $yamlContent} in the context of $blockid
//  * @param {string} wasmUnit8Array
//  * @param {string} yamlContent
//  * @param {Array<string>} rawreceiptList
//  * @param {boolean} isLocal
//  * @param {boolean} enableLog
//  * @returns {Uint8Array} - execution result (aka. zkgraph state)
//  */
// export async function executeOnRawReceipts(wasmUnit8Array, yamlContent, rawreceiptList, isLocal=false, enableLog=true) {

//     const zkgyaml = ZkGraphYaml.fromYamlContent(yamlContent)
//     const provider = new providers.JsonRpcProvider(rpcUrl);

//     const [eventDSAddrList, eventDSEsigsList] = zkgyaml.dataSources[0].event.toArray();


//     // prepare data

//     // filter
//     const [rawReceipts, matchedEventOffsets] = filterEvents(eventDSAddrList, eventDSEsigsList, rawreceiptList, enableLog).catch((error) => {
//       throw error;
//     })

//     // create blockPrepMap
//     let blockNumber = 0; // to compitable, use fixed block num

//     let blockPrep = new BlockPrep(
//       blockNumber,
//       // header rlp
//       "0x00",
//     )
//     blockPrep.addRLPReceipts(rawreceiptList)

//     let blockPrepMap = new Map();
//     blockPrepMap.set(blockNumber, blockPrep)

//     let blocknumOrder = [blockNumber]

//     // gen inputs
//     let input = new Input();
//     input = fillExecInput(input, zkgyaml, blockPrepMap, blocknumOrder)
//     let [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()];

//     return await executeOnInputs(wasmUnit8Array, privateInputStr, publicInputStr)
// }
