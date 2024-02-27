import fs from 'node:fs'
import { describe, it } from 'vitest'
import { ethers, providers } from 'ethers'
import * as cleapi from '../src/index'
import { DEFAULT_URL } from '../src/common/constants'
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
    const provider = new providers.JsonRpcProvider('http://localhost') // not important
    const signer = new ethers.Wallet(config.UserPrivateKey, provider)
    const result = await cleapi.setup(
      { wasmUint8Array },
      // { circuitSize: 22, proverUrl: DEFAULT_URL.ZKWASMHUB, signer },
      { circuitSize: 22, proverUrl: DEFAULT_URL.ZKWASMHUB, signer },
    )
    result
    // console.log('test result', result)
  }, { timeout: 10000 })
})
