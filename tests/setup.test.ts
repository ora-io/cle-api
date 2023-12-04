import fs from 'node:fs'
import { describe, it } from 'vitest'
import * as zkgapi from '../src/index'
import { config } from './config'

(global as any).__BROWSER__ = false

describe('test exec', () => {
  it('test setup', async () => {
    const wasm = fs.readFileSync('tests/build/zkgraph_full.wasm')
    const wasmUint8Array = new Uint8Array(wasm)
    const result = await zkgapi.setup(
      'poc.wasm',
      { wasmUint8Array, zkgraphYaml: null },
      22,
      config.UserPrivateKey,
      // "https://zkwasm-explorer.delphinuslab.com:8090",
      'https://rpc.zkwasmhub.com:8090',
      true,
      true)

    // eslint-disable-next-line no-console
    console.log(result)
  })
})
