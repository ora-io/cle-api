/* eslint-disable no-console */
import fs from 'node:fs'
import { describe, it } from 'vitest'
import * as zkgapi from '../src/index'
import { config } from './config'
import { getLatestBlocknumber } from './utils/ethers'

(global as any).__BROWSER__ = false

const blocknumfortest = {
  sepolia: 4818711, // to test event use 2279547, to test storage use latest blocknum
  mainnet: 17633573,
}

const execOptions = {
  blockId: blocknumfortest.sepolia,
  wasmPath: 'tests/build/zkgraph_full.wasm',
  yamlPath: 'tests/testsrc/zkgraph-storage.yaml',
  jsonRpcProviderUrl: config.JsonRpcProviderUrl.sepolia,
  local: false,
}
execOptions.blockId = await getLatestBlocknumber(execOptions.jsonRpcProviderUrl)

describe('test exec', () => {
  it('test_exec', async () => {
    const { yamlPath, jsonRpcProviderUrl, wasmPath, blockId, local } = execOptions

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath) as zkgapi.ZkGraphYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const execParams = dsp.toExecParams(
      {
        jsonRpcUrl: jsonRpcProviderUrl,
        blockId,
      },
    )
    const state = await zkgapi.execute(
      { wasmUint8Array, zkgraphYaml: yaml },
      execParams,
      local,
      true,
    )

    return state
  })

  it('test_exec_with_prepare_data', async () => {
    const { yamlPath, jsonRpcProviderUrl, wasmPath, blockId, local } = execOptions

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath) as zkgapi.ZkGraphYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const execParams = dsp.toExecParams(
      {
        jsonRpcUrl: jsonRpcProviderUrl,
        blockId,
      },
    )

    /**
     * Prepare Data, can construct your own dataPrep based on this.
     * the actual dataPrep here is instance of zkgapi.ETHDSP.EthereumDataPrep
     */
    const dataPrep = await dsp.prepareData(yaml, await dsp.toPrepareParamsFromExecParams(execParams))

    const state = await zkgapi.executeOnDataPrep(
      { wasmUint8Array, zkgraphYaml: yaml },
      dataPrep,
      local,
      true,
    )

    return state
  })

  it('test_exec_then_prove', async () => {
    const generalParams = {
      jsonRpcUrl: config.JsonRpcProviderUrl.sepolia,
      blockId: blocknumfortest.sepolia,
    }

    const testOptions = {
      generalParams,
      wasmPath: 'tests/build/zkgraph-event.wasm',
      yamlPath: 'tests/testsrc/zkgraph-event.yaml',
      local: false,
      zkwasmUrl: 'https://rpc.zkwasmhub.com:8090',
    }

    const { wasmPath, yamlPath, local } = testOptions

    /**
     * assemble zkGraphExecutable & get dsp
     */

    // get wasmUint8Array & Yaml
    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath) as zkgapi.ZkGraphYaml

    const zkGraphExecutable = { wasmUint8Array, zkgraphYaml: yaml }

    // get dsp
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    /**
     * Execute
     */

    // get exec params
    const execParams = dsp.toExecParams(generalParams)

    // Prepare Data, can construct your own dataPrep based on this.
    // the actual dataPrep here is instance of zkgapi.ETHDSP.EthereumDataPrep
    let dataPrep = await dsp.prepareData(yaml, await dsp.toPrepareParamsFromExecParams(execParams))

    const stateu8a = await zkgapi.executeOnDataPrep(
      { wasmUint8Array, zkgraphYaml: yaml },
      dataPrep,
      local,
      true,
    )
    const stateStr = zkgapi.utils.toHexString(stateu8a)

    // /**
    //  * the 2nd way to exec get state.
    //  * gen private/public input (without expectedState)
    //  */
    // let input = new zkgapi.Input();
    // input = dsp.fillExecInput(input, yaml, dataPrep)
    // let [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()];

    // console.log(`(Execute) Private Input: ${privateInputStr}`)
    // console.log(`(Execute) Public Input: ${publicInputStr}`)

    // // execute, get state
    // const state = await zkgapi.executeOnInputs(zkGraphExecutable, privateInputStr, publicInputStr)

    console.log(`ZKGRAPH STATE OUTPUT: ${stateStr}`)

    /**
     * Prove Input Gen
     */

    dataPrep = dsp.toProveDataPrep(dataPrep, stateStr)
    const [privateInputStr, publicInputStr] = zkgapi.proveInputGenOnDataPrep(zkGraphExecutable, dataPrep)

    console.log(`(Prove) Private Input: ${privateInputStr}`)
    console.log(`(Prove) Public Input: ${publicInputStr}`)
  })
})
