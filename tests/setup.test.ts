import fs from 'node:fs'
import { describe, it } from 'vitest'
import { ethers, providers } from 'ethers'
import * as cleapi from '../src/index'
import { config } from './config'
import { fixtures } from './fixtures/fixureoptions'

(global as any).__BROWSER__ = false

const fixtureKey = config.fixture
const option = fixtures[fixtureKey]

describe('test setup', () => {
  it('test setup', async () => {
    const { wasmPath } = option
    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    const provider = new providers.JsonRpcProvider('http://localhost') // not important
    const signer = new ethers.Wallet(config.UserPrivateKey, provider)
    const result = await cleapi.setup(
      { wasmUint8Array },
      { circuitSize: 22, proverUrl: config.ZkwasmProviderUrl, signer },
    )
    result
    // console.log('test result', result)
  }, { timeout: 100000 })
})
