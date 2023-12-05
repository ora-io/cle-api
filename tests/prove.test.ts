/* eslint-disable no-console */
import fs from 'node:fs'
import { describe, it } from 'vitest'
import * as zkgapi from '../src/index'
import { loadConfigByNetwork } from '../src/common/utils'
import { config } from './config'
import { getLatestBlocknumber } from './utils/ethers'

(global as any).__BROWSER__ = false

// const blocknumForEventTest = {
//   sepolia: 2279547, // to test event use 2279547, to test storage use latest blocknum
//   mainnet: 17633573,
// }

const blocknumForStorageTest = {
  sepolia: await getLatestBlocknumber(config.JsonRpcProviderUrl.sepolia),
  mainnet: await getLatestBlocknumber(config.JsonRpcProviderUrl.mainnet),
}

const expectedStateStrForTest = {
  // update this when update the blocknumfortest
  sepolia: '0x6370902000000003336530047e5ec3da40c000000000068f1888e6eb7036fffe',
}

// const proveModeOptionsForEvent = {
//   wasmPath: 'tests/build/zkgraph-event.wasm',
//   yamlPath: 'tests/testsrc/zkgraph-event.yaml',
//   zkwasmUrl: 'https://rpc.zkwasmhub.com:8090',
// }

const proveModeOptionsForStorage = {
  wasmPath: 'tests/build/zkgraph-storage.wasm',
  yamlPath: 'tests/testsrc/zkgraph-storage.yaml',
  zkwasmUrl: 'https://rpc.zkwasmhub.com:8090',
}

describe('test prove', () => {
  it('test prove mode', async () => {
    const { wasmPath, yamlPath, zkwasmUrl } = proveModeOptionsForStorage

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath) as zkgapi.ZkGraphYaml

    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const generalParams = {
      jsonRpcUrl,
      blockId: loadConfigByNetwork(yaml, blocknumForStorageTest, true), // for storage
      expectedStateStr: loadConfigByNetwork(yaml, expectedStateStrForTest, true), // for storage
      // blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    const proveParams = dsp.toProveParams(generalParams)

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
