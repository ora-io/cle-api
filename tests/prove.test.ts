import fs from 'node:fs'
import { ethers, providers } from 'ethers'
import { describe, expect, it } from 'vitest'
import { loadConfigByNetwork } from '../src/common/utils'
import * as cleapi from '../src/index'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'
import { fixtures } from './fixtures/fixureoptions'

(global as any).__BROWSER__ = false

const fixtureKey = config.fixture
const option = fixtures[fixtureKey]
let proveTaskId: string

describe(`test prove ${fixtureKey}`, () => {
  // console.log('issued a prove taslk: ', result)
  it.only('test mock mode', async () => {
    const { yamlPath, wasmPath, blocknum, expectedState } = option

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as cleapi.CLEYaml
    const dsp = cleapi.dspHub.getDSPByYaml(yaml)
    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknum, true),
      expectedStateStr: expectedState,
    }

    const proveParams = dsp?.toProveParams(generalParams)
    const input = await cleapi.proveInputGen(
      { cleYaml: yaml }, // doesn't care about wasmUint8Array
      proveParams as any,
    )

    console.log(input.auxParams)

    const res = await cleapi.proveMock(
      { wasmUint8Array },
      input,
    )
    console.log('mock result:', res)
  }, { timeout: 100000 })
  it('test prove mode', async () => {
    const { wasmPath, yamlPath, blocknum, expectedState } = option
    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    const yaml = loadYamlFromPath(yamlPath) as cleapi.CLEYaml

    const dsp = cleapi.dspHub.getDSPByYaml(yaml)

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknum, true),
      expectedStateStr: expectedState,
    }

    const proveParams = dsp?.toProveParams(generalParams)

    const input = await cleapi.proveInputGen(
      { cleYaml: yaml }, // doesn't care about wasmUint8Array
      proveParams as any,
    )

    // console.log(privateInputStr);
    // console.log("-------------------");
    // console.log(publicInputStr);
    const userPrivateKey = config.UserPrivateKey
    const signer = new ethers.Wallet(userPrivateKey, provider)

    const result = await cleapi.requestProve(
      { wasmUint8Array }, // doesn't care about cleYaml
      input,
      {
        proverUrl: config.ZkwasmProviderUrl,
        signer,
        batchStyle: cleapi.BatchStyle.ZKWASMHUB,
      })

    console.log(result)

    proveTaskId = result.taskId

    expect(result.taskId).toBeTypeOf('string')
  }, { timeout: 100000 })

  it('test waitProve', async () => {
    // use proveTaskId from "test prove mode" first
    const taskId = proveTaskId || config.proveTaskId
    const result = await cleapi.waitProve(config.ZkwasmProviderUrl, taskId as string, { batchStyle: cleapi.BatchStyle.ZKWASMHUB })
    // console.log(result.proofParams?.instances)
    expect((result.proofParams?.instances as any[])[0]).toBeInstanceOf(Array)
  }, { timeout: 100000 })
})
