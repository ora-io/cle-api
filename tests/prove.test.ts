/* eslint-disable no-console */
import fs from 'node:fs'
import { describe, it } from 'vitest'
import * as zkgapi from '../src/index'
import { config } from './config'

(global as any).__BROWSER__ = false

const blocknumfortest = {
  sepolia: 4818711, // to test event use 2279547, to test storage use latest blocknum
  mainnet: 17633573,
}
const zkgstatefortest = {
  // update this when update the blocknumfortest
  sepolia: '0x6370902000000003336530047e5ec3da40c000000000068f1888e6eb7036fffe',
}

const proveModeOptions = {
  wasmPath: 'tests/build/zkgraph_full.wasm',
  yamlPath: 'tests/testsrc/zkgraph-storage.yaml',
  blockId: blocknumfortest.sepolia,
  expectedStateStr: zkgstatefortest.sepolia,
  zkwasmUrl: 'https://rpc.zkwasmhub.com:8090',
}

describe('test prove', () => {
  it('test prove mode', async () => {
    const { wasmPath, yamlPath, blockId, expectedStateStr, zkwasmUrl } = proveModeOptions

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath) as zkgapi.ZkGraphYaml

    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const proveParams = dsp.toProveParams(
      {
        jsonRpcUrl: config.JsonRpcProviderUrl.sepolia,
        blockId,
        expectedStateStr,
      },
    )

    const [privateInputStr, publicInputStr] = await zkgapi.proveInputGen(
      { wasmUint8Array: null, zkgraphYaml: yaml }, // doesn't care about wasmUint8Array
      proveParams,
      false,
      true,
    )

    console.log([privateInputStr, publicInputStr])

    const result = await zkgapi.prove(
      { wasmUint8Array, zkgraphYaml: null }, // doesn't care about zkgraphYaml
      privateInputStr,
      publicInputStr,
      zkwasmUrl,
      config.UserPrivateKey,
      true)
    console.log(result)
  })
  // it('test mock mode', async () => {
  //   const { yamlPath, wasmPath, blockId, expectedStateStr } = proveModeOptions

  //   const wasm = fs.readFileSync(wasmPath)
  //   const wasmUint8Array = new Uint8Array(wasm)
  //   // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
  //   const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath) as zkgapi.ZkGraphYaml
  //   const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

  //   const proveParams = dsp.toProveParams(
  //     {
  //       jsonRpcUrl: config.JsonRpcProviderUrl.sepolia,
  //       blockId,
  //       expectedStateStr,
  //     },
  //   )
  //   const [privateInputStr, publicInputStr] = await zkgapi.proveInputGen(
  //     { wasmUint8Array: null, zkgraphYaml: yaml }, // doesn't care about wasmUint8Array
  //     proveParams,
  //     false,
  //     true,
  //   )

  //   const res = await zkgapi.proveMock(
  //     { wasmUint8Array, zkgraphYaml: null },
  //     privateInputStr,
  //     publicInputStr,
  //   )
  //   console.log(res)
  // })
})
