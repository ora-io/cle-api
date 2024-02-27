import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { providers } from 'ethers'
import { loadConfigByNetwork, toHexString } from '../src/common/utils'
import * as zkgapi from '../src/index'
import { loadYamlFromPath } from './utils/yaml'
import { config } from './config'
import { fixtures } from './fixureoptions'

(global as any).__BROWSER__ = false

// const pathfromfixtures = 'dsp/ethereum(storage)'
const pathfromfixtures = 'dsp/ethereum.unsafe-ethereum'
const option = fixtures[pathfromfixtures]

describe(`test dsp: ${pathfromfixtures}`, () => {
  it('test exec', async () => {
    const { wasmPath, yamlPath, expectedState, blocknum } = option

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { })
    // const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknum, true), // for storage
      // blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    const execParams = dsp?.toExecParams(generalParams)

    const state = await zkgapi.execute(
      { wasmUint8Array, cleYaml: yaml },
      execParams as any,
    )
    // console.log(toHexString(state))

    expect(toHexString(state)).toEqual(expectedState)
    return state
  }, { timeout: 100000 })
})
