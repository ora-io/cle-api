import fs from 'node:fs'
import { providers } from 'ethers'
import { expect } from 'vitest'
import { loadConfigByNetwork, toHexString } from '../src/common/utils'
import * as cleapi from '../src/index'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'

export async function testExecute(option: any) {
  const { wasmPath, yamlPath, expectedState, blocknum } = option

  const wasm = fs.readFileSync(wasmPath)
  const wasmUint8Array = new Uint8Array(wasm)
  // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
  const yaml = loadYamlFromPath(yamlPath) as cleapi.CLEYaml
  const dsp = cleapi.dspHub.getDSPByYaml(yaml, { })
  // const dsp = cleapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

  const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
  const provider = new providers.JsonRpcProvider(jsonRpcUrl)
  const generalParams = {
    provider,
    blockId: loadConfigByNetwork(yaml, blocknum, true), // for storage
    // blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
  }

  const execParams = dsp?.toExecParams(generalParams)

  const state = await cleapi.execute(
    { wasmUint8Array, cleYaml: yaml },
    execParams as any,
  )
  // console.log(toHexString(state))

  expect(toHexString(state)).toEqual(expectedState)
  return state
}
