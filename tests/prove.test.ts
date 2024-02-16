import fs from 'node:fs'
import { ethers, providers } from 'ethers'
import { describe, it } from 'vitest'
import { loadConfigByNetwork } from '../src/common/utils'
import * as zkgapi from '../src/index'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'
import { fixtures } from './fixureoptions'

(global as any).__BROWSER__ = false

// const blocknumForEventTest = {
//   sepolia: 2279547, // to test event use 2279547, to test storage use latest blocknum
//   mainnet: 17633573,
// }

// const blocknumForStorageTest = {
//   sepolia: await getLatestBlocknumber(config.JsonRpcProviderUrl.sepolia),
//   mainnet: await getLatestBlocknumber(config.JsonRpcProviderUrl.mainnet),
// }

const pathfromfixtures = 'prove(event)'
const option = fixtures[pathfromfixtures]

describe(`test prove ${pathfromfixtures}`, () => {
  // console.log('issued a prove taslk: ', result)
  it.only('test mock mode', async () => {
    const { yamlPath, wasmPath, blocknum, expectedState } = option

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })
    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknum, true),
      expectedStateStr: expectedState,
    }

    const proveParams = dsp?.toProveParams(generalParams)
    const input = await zkgapi.proveInputGen(
      { cleYaml: yaml }, // doesn't care about wasmUint8Array
      proveParams as any,
    )

    // console.log(input)

    const res = await zkgapi.proveMock(
      { wasmUint8Array },
      input,
    )
    console.log('mock result:', res)
  })
  it('test prove mode', async () => {
    const { wasmPath, yamlPath, zkwasmUrl, blocknum, expectedState } = option
    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml

    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknum, true),
      expectedStateStr: expectedState,
    }

    const proveParams = dsp?.toProveParams(generalParams)

    const input = await zkgapi.proveInputGen(
      { cleYaml: yaml }, // doesn't care about wasmUint8Array
      proveParams as any,
      false,
    )

    // console.log(privateInputStr);
    // console.log("-------------------");
    // console.log(publicInputStr);
    const userPrivateKey = config.UserPrivateKey
    const signer = new ethers.Wallet(userPrivateKey, provider)

    const result = await zkgapi.prove(
      { wasmUint8Array }, // doesn't care about cleYaml
      input,
      zkwasmUrl,
      signer,
      true)

    console.log(result)
  })
})
