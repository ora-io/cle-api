import fs from 'node:fs'
import { describe, it } from 'vitest'
import * as zkgapi from '../src/index'
import { config } from './config'
import { createFileFromUint8Array } from './utils/file'

(global as any).__BROWSER__ = false

describe('test exec', () => {
  it('test setup', async () => {
    const wasm = fs.readFileSync('tests/build/zkgraph-storage.wasm')
    const wasmUint8Array = new Uint8Array(wasm)
    const image = createFileFromUint8Array(wasm, 'poc.wasm')
    const result = await zkgapi.setup(
      'poc.wasm',
      { wasmUint8Array, zkgraphYaml: null, image },
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
