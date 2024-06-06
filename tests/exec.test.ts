import fs from 'node:fs'
import { providers } from 'ethers'
import { describe, expect, it } from 'vitest'
import { loadConfigByNetwork, toHexString } from '../src/common/utils'
import * as cleapi from '../src/index'
import { DSPNotFound } from '../src/common/error'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'
import { fixtures } from './fixtures/fixureoptions'
import { testExecute } from './exec_test_impl'

(global as any).__BROWSER__ = false

const fixtureKey = config.fixture
const option = fixtures[fixtureKey]

// enable this to silence logs
// cleapi.setCLELogger(new cleapi.SilentLogger())

describe('test exec', () => {
  it('test exec', async () => {
    await testExecute(option)
  }, { timeout: 100000 })

  it('test_exec_with_prepare_data', async () => {
    const { wasmPath, yamlPath, expectedState, blocknum } = option

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as cleapi.CLEYaml
    const dsp = cleapi.dspHub.getDSPByYaml(yaml)
    if (!dsp)
      throw new DSPNotFound('DSP not found')

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknum, true), // for storage
      // blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    const execParams = dsp?.toExecParams(generalParams)

    /**
     * Prepare Data, can construct your own dataPrep based on this.
     * the actual dataPrep here is instance of cleapi.ETHDSP.EthereumDataPrep
     */
    const dataPrep = await dsp?.prepareData(yaml, await dsp.toPrepareParams(execParams, 'exec'))

    const state = await cleapi.executeOnDataPrep(
      { wasmUint8Array, cleYaml: yaml },
      dataPrep as cleapi.DataPrep,
    )

    expect(toHexString(state)).toEqual(expectedState)
    return state
  }, { timeout: 100000 })

  it('test_exec_then_prove', async () => {
    const { wasmPath, yamlPath, expectedState, blocknum } = option

    /**
     * assemble cleExecutable & get dsp
     */

    // get wasmUint8Array & Yaml
    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as cleapi.CLEYaml
    const cleExecutable = { wasmUint8Array, cleYaml: yaml }
    // get dsp
    const dsp = cleapi.dspHub.getDSPByYaml(yaml)
    if (!dsp)
      throw new DSPNotFound('DSP not found')
    // get pre-defined test params
    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      // blockId: loadConfigByNetwork(yaml, blocknumForStorageTest, true), // for storage
      blockId: loadConfigByNetwork(yaml, blocknum, true), // for event
    }

    /**
     * Execute
     */

    // get exec params
    const execParams = dsp?.toExecParams(generalParams)

    // Prepare Data, can construct your own dataPrep based on this.
    // the actual dataPrep here is instance of cleapi.ETHDSP.EthereumDataPrep
    let dataPrep = await dsp?.prepareData(yaml, await dsp.toPrepareParams(execParams, 'exec'))

    const stateu8a = await cleapi.executeOnDataPrep(
      { wasmUint8Array, cleYaml: yaml },
      dataPrep as cleapi.DataPrep,
    )
    expect(toHexString(stateu8a)).toEqual(expectedState)

    const stateStr = cleapi.utils.toHexString(stateu8a)

    // /**
    //  * the 2nd way to exec get state.
    //  * gen private/public input (without expectedState)
    //  */
    // let input = new cleapi.Input();
    // input = dsp.fillExecInput(input, yaml, dataPrep)
    // let [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()];

    // console.log(`(Execute) Private Input: ${privateInputStr}`)
    // console.log(`(Execute) Public Input: ${publicInputStr}`)

    // // execute, get state
    // const state = await cleapi.executeOnInputs(cleExecutable, privateInputStr, publicInputStr)

    // console.log(`CLE STATE OUTPUT: ${stateStr}`)

    /**
     * Prove Input Gen
     */

    dataPrep = dsp?.toProveDataPrep(dataPrep, stateStr)
    const input = cleapi.proveInputGenOnDataPrep(cleExecutable, dataPrep as cleapi.DataPrep)
    input
    // console.log(`(Prove) Private Input: ${input.getPrivateInputStr()}`)
    // console.log(`(Prove) Public Input: ${input.getPublicInputStr()}`)
  }, { timeout: 100000 })
})
