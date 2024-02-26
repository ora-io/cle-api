import fs from 'node:fs'
import { ethers, providers } from 'ethers'
import { describe, expect, it } from 'vitest'
import { loadConfigByNetwork } from '../src/common/utils'
import * as zkgapi from '../src/index'
import { BatchStyle } from '../src/api/setup'
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

// const pathfromfixtures = 'prove(event)'
const pathfromfixtures = 'prove(storage)'
const option = fixtures[pathfromfixtures]

describe(`test prove ${pathfromfixtures}`, () => {
  // console.log('issued a prove taslk: ', result)
  it('test mock mode', async () => {
    const { yamlPath, wasmPath, blocknum, expectedState } = option

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml)
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

    console.log(input.auxParams)

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

    const dsp = zkgapi.dspHub.getDSPByYaml(yaml)

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

    // console.log(privateInputStr);
    // console.log("-------------------");
    // console.log(publicInputStr);
    const userPrivateKey = config.UserPrivateKey
    const signer = new ethers.Wallet(userPrivateKey, provider)

    const result = await zkgapi.requestProve(
      { wasmUint8Array }, // doesn't care about cleYaml
      input,
      { proverUrl: zkwasmUrl, signer })

    console.log(result)
    expect(result.taskId).toBeTypeOf('string')
  }, { timeout: 100000 })

  it.only('test waitProve', async () => {
    const { zkwasmUrl } = option
    const taskId = '65dae256429af08ed922479a'
    const result = await zkgapi.waitProve(zkwasmUrl, taskId as string, { batchStyle: BatchStyle.ZKWASMHUB })
    // console.log(result.proofParams?.instances)
    expect((result.proofParams?.instances as any[])[0]).toBeInstanceOf(Array)
  }, { timeout: 100000 })
})
