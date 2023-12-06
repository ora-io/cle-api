import { ZKWASMMock } from '../common/zkwasm_mock'
import { instantiateWasm, setupZKWasmMock } from '../common/bundle'
import { Input } from '../common/input'
import { dspHub } from '../dsp/hub'
import type { DataPrep } from '../dsp/interface'
import type { ZkGraphExecutable } from '../types/api'
import { OldBlockNumber } from '../common/error'

/**
 * Execute the given zkGraphExecutable in the context of execParams
 * @param {object} zkGraphExecutable {'zkgraphYaml': zkgraphYaml}
 * @param {object} execParams
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {Uint8Array} - execution result (aka. zkgraph state)
 */
export async function execute(zkGraphExecutable: ZkGraphExecutable, execParams: Record<string, any>, isLocal = false, _enableLog = true) {
  const { zkgraphYaml } = zkGraphExecutable

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, { isLocal })

  try {
    const prepareParams = await dsp.toPrepareParamsFromExecParams(execParams)
    const dataPrep /** :DataPrep */ = await dsp.prepareData(zkgraphYaml, prepareParams)

    return await executeOnDataPrep(zkGraphExecutable, dataPrep)
  }
  catch (error: any) {
    if (error.body.includes('requested block is too old')) {
      const body = JSON.parse(error.body)
      throw new OldBlockNumber(body.error.message)
    }
    else {
      throw error
    }
  }
}

/**
 *
 * @param {object} zkGraphExecutable
 * @param {DataPrep} dataPrep
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns
 */
export async function executeOnDataPrep(zkGraphExecutable: ZkGraphExecutable, dataPrep: DataPrep, isLocal = false, _enableLog = true) {
  const { zkgraphYaml } = zkGraphExecutable

  let input = new Input()

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, { isLocal })

  input = dsp.fillExecInput(input, zkgraphYaml, dataPrep)

  const [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()]

  return await executeOnInputs(zkGraphExecutable, privateInputStr, publicInputStr)
}

/**
 *
 * @param {object} zkGraphExecutable
 * @param {string} privateInputStr
 * @param {string} publicInputStr
 * @returns
 */
export async function executeOnInputs(zkGraphExecutable: ZkGraphExecutable, privateInputStr: string, publicInputStr: string) {
  const { wasmUint8Array } = zkGraphExecutable
  if (!wasmUint8Array)
    throw new Error('wasmUint8Array is null')

  const mock = new ZKWASMMock()
  mock.set_private_input(privateInputStr)
  mock.set_public_input(publicInputStr)
  setupZKWasmMock(mock)

  const { asmain } = await instantiateWasm(wasmUint8Array).catch((error) => {
    throw error
  })

  let stateU8a
  // eslint-disable-next-line no-useless-catch
  try {
    stateU8a = asmain()
  }
  catch (e) {
    throw e
  }
  return stateU8a as Uint8Array
}

// /**
//  * // TODO: compitable purpose
//  * // Deprecated since yaml specVersion: v0.0.2
//  * Execute the given zkgraph {$wasmUint8Array, $yamlContent} in the context of $blockid
//  * @param {string} wasmUint8Array
//  * @param {string} yamlContent
//  * @param {Array<string>} rawreceiptList
//  * @param {boolean} isLocal
//  * @param {boolean} enableLog
//  * @returns {Uint8Array} - execution result (aka. zkgraph state)
//  */
// export async function executeOnRawReceipts(wasmUint8Array, yamlContent, rawreceiptList, isLocal=false, enableLog=true) {

//     const zkgraphYaml = ZkGraphYaml.fromYamlContent(yamlContent)
//     const provider = new providersonRpcProvider(rpcUrl);

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

//     return await executeOnInputs(wasmUint8Array, privateInputStr, publicInputStr)
// }
