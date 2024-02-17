import fs from 'node:fs'
import { providers } from 'ethers'
import { describe, it } from 'vitest'
import { loadConfigByNetwork } from '../src/common/utils'
import * as zkgapi from '../src/index'
import { DSPNotFound } from '../src/common/error'
import { config } from './config'
import { getLatestBlocknumber } from './utils/ethers'
import { loadYamlFromPath } from './utils/yaml'

(global as any).__BROWSER__ = false

const blocknumForEventTest = {
  sepolia: 2279547, // to test event use 2279547, to test storage use latest blocknum
  mainnet: 17633573,
}

const blocknumForStorageTest = {
  sepolia: await getLatestBlocknumber(config.JsonRpcProviderUrl.sepolia),
  mainnet: await getLatestBlocknumber(config.JsonRpcProviderUrl.mainnet),
}

const execOptionsForEvent = {
  wasmPath: 'tests/build/cle-event.wasm',
  yamlPath: 'tests/testsrc/cle-event.yaml',
  local: false,
}

const execOptionsForStorage = {
  wasmPath: 'tests/build/cle-storage.wasm',
  yamlPath: 'tests/testsrc/cle-storage.yaml',
  local: false,
}

describe('test exec', () => {
  it('test_exec', async () => {
    const wasmPath = 'tests/build/cle-latest.wasm'
    const yamlPath = 'tests/testsrc/cle-latest.yaml'
    const local = false

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      // blockId: loadConfigByNetwork(yaml, blocknumForStorageTest, true), // for storage
      blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    const execParams = dsp?.toExecParams(generalParams)
    const state = await zkgapi.execute(
      { wasmUint8Array, cleYaml: yaml },
      execParams as any,
      local,
    )

    return state
  }, { timeout: 100000 })

  it('test_exec_with_latest', async () => {
    const { wasmPath, yamlPath, local } = execOptionsForEvent

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      // blockId: loadConfigByNetwork(yaml, blocknumForStorageTest, true), // for storage
      blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    const execParams = dsp?.toExecParams(generalParams)
    const state = await zkgapi.execute(
      { wasmUint8Array, cleYaml: yaml },
      execParams as any,
      local,
    )

    return state
  }, { timeout: 100000 })

  it('test_exec_with_prepare_data', async () => {
    const { wasmPath, yamlPath, local } = execOptionsForStorage

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })
    if (!dsp)
      throw new DSPNotFound('DSP not found')

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknumForStorageTest, true), // for storage
      // blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    const execParams = dsp?.toExecParams(generalParams)

    /**
     * Prepare Data, can construct your own dataPrep based on this.
     * the actual dataPrep here is instance of zkgapi.ETHDSP.EthereumDataPrep
     */
    const dataPrep = await dsp?.prepareData(yaml, await dsp.toPrepareParams(execParams, 'exec'))

    const state = await zkgapi.executeOnDataPrep(
      { wasmUint8Array, cleYaml: yaml },
      dataPrep as zkgapi.DataPrep,
      local,
    )

    return state
  }, { timeout: 100000 })

  it('test_exec_then_prove', async () => {
    const { wasmPath, yamlPath, local } = execOptionsForEvent

    /**
     * assemble cleExecutable & get dsp
     */

    // get wasmUint8Array & Yaml
    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const cleExecutable = { wasmUint8Array, cleYaml: yaml }
    // get dsp
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })
    if (!dsp)
      throw new DSPNotFound('DSP not found')
    // get pre-defined test params
    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      // blockId: loadConfigByNetwork(yaml, blocknumForStorageTest, true), // for storage
      blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    /**
     * Execute
     */

    // get exec params
    const execParams = dsp?.toExecParams(generalParams)

    // Prepare Data, can construct your own dataPrep based on this.
    // the actual dataPrep here is instance of zkgapi.ETHDSP.EthereumDataPrep
    let dataPrep = await dsp?.prepareData(yaml, await dsp.toPrepareParams(execParams, 'exec'))

    const stateu8a = await zkgapi.executeOnDataPrep(
      { wasmUint8Array, cleYaml: yaml },
      dataPrep as zkgapi.DataPrep,
      local,
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
    // const state = await zkgapi.executeOnInputs(cleExecutable, privateInputStr, publicInputStr)

    console.log(`CLE STATE OUTPUT: ${stateStr}`)

    /**
     * Prove Input Gen
     */

    dataPrep = dsp?.toProveDataPrep(dataPrep, stateStr)
    const input = zkgapi.proveInputGenOnDataPrep(cleExecutable, dataPrep as zkgapi.DataPrep)

    console.log(`(Prove) Private Input: ${input.getPrivateInputStr()}`)
    console.log(`(Prove) Public Input: ${input.getPublicInputStr()}`)
  }, { timeout: 100000 })
})
