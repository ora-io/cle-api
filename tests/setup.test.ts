import fs from 'node:fs'
import { describe, it } from 'vitest'
import { ethers, providers } from 'ethers'
import * as zkgapi from '../src/index'
import { config } from './config'
import { fixtures } from './fixureoptions'

(global as any).__BROWSER__ = false

const pathfromfixtures = 'dsp/ethereum(storage)'
const option = fixtures[pathfromfixtures]

describe('test setup', () => {
  it('test setup', async () => {
    const { wasmPath } = option
    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    // const image = createFileFromUint8Array(wasm, 'poc.wasm')
    // const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    // const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const provider = new providers.JsonRpcProvider('http://localhost') // not important
    const signer = new ethers.Wallet(config.UserPrivateKey, provider)
    const result = await zkgapi.setup(
      { wasmUint8Array },
      { circuitSize: 22, proverUrl: 'http://localhost:8080', signer },
    )

    console.log('test result', result)
  })
})
