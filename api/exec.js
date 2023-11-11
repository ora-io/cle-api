import { ZKWASMMock } from "../common/zkwasm_mock.js";
import { instantiateWasm, setupZKWasmMock } from "../common/bundle.js";
import { Input } from "../common/input.js";
import { dspHub } from "../dsp/hub.js";
import { DataPrep } from "../dsp/interface.js";

/**
 * Execute the given zkGraphExecutable in the context of execParams
 * @param {object} zkGraphExecutable {'zkgraphYaml': zkgraphYaml}
 * @param {object} execParams 
 * @param {boolean} isLocal 
 * @param {boolean} enableLog 
 * @returns {Uint8Array} - execution result (aka. zkgraph state)
 */
export async function execute(zkGraphExecutable, execParams, isLocal=false, enableLog=true) {

  // TODO: mv this log to cli
    // if (enableLog){
    //     console.log(`[*] Run zkgraph on block ${blockid}\n`);
    // }
    const { zkgraphYaml } = zkGraphExecutable;
  
    let dsp /**:DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, {'isLocal': isLocal});

    let prepareParams = await dsp.toPrepareParamsFromExecParams(execParams)
    let dataPrep /**:DataPrep */ = await dsp.prepareData(zkgraphYaml, prepareParams)

    return executeOnDataPrep(zkGraphExecutable, dataPrep)
}

/**
 * 
 * @param {object} zkGraphExecutable 
 * @param {DataPrep} dataPrep 
 * @param {boolean} isLocal 
 * @param {boolean} enableLog 
 * @returns 
 */
export async function executeOnDataPrep(zkGraphExecutable, dataPrep, isLocal=false, enableLog=true) {
  const { wasmUnit8Array, zkgraphYaml } = zkGraphExecutable;
  
  let input = new Input();

  let dsp /**:DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, {'isLocal': isLocal});

  input = dsp.fillExecInput(input, zkgraphYaml, dataPrep)
  
  let [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()];

  return await executeOnInputs(wasmUnit8Array, privateInputStr, publicInputStr)
}

/**
 * 
 * @param {object} zkGraphExecutable 
 * @param {string} privateInputStr 
 * @param {string} publicInputStr 
 * @returns 
 */
export async function executeOnInputs(zkGraphExecutable, privateInputStr, publicInputStr) {
  const { wasmUnit8Array } = zkGraphExecutable;

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

//     const zkgraphYaml = ZkGraphYaml.fromYamlContent(yamlContent)
//     const provider = new providers.JsonRpcProvider(rpcUrl);

//     const [eventDSAddrList, eventDSEsigsList] = zkgraphYaml.dataSources[0].event.toArray();


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
//     input = fillExecInput(input, zkgraphYaml, blockPrepMap, blocknumOrder)
//     let [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()];

//     return await executeOnInputs(wasmUnit8Array, privateInputStr, publicInputStr)
// }
