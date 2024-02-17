import fs from 'node:fs'
import { describe, it } from 'vitest'
import { ethers, providers } from 'ethers'
import * as zkgapi from '../src/index'
import { config } from './config'

(global as any).__BROWSER__ = false

describe('test exec', () => {
  it('test setup', async () => {
    const wasm = fs.readFileSync('tests/fixtures/build/dsp/ethereum(storage).wasm')
    const wasmUint8Array = new Uint8Array(wasm)
    // const image = createFileFromUint8Array(wasm, 'poc.wasm')
    // const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider('http://localhost')
    const signer = new ethers.Wallet(config.UserPrivateKey, provider)
    const result = await zkgapi.setup(
      { wasmUint8Array },
      { circuitSize: 22, proverUrl: 'https://rpc.zkwasmhub.com:8090', signer },
    )

    console.log(result)
  })
})
