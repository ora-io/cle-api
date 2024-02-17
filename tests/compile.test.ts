import path from 'path'
import fs from 'fs'
import { expect, it } from 'vitest'
import { objectKeys } from '@murongg/utils'
import webjson from '@ora-io/cle-lib/test/weblib/weblib.json'
import { compile } from '../src/api/compile'
import { loadYamlFromPath } from './utils/yaml'
// import { config } from './config'
import { createOnNonexist } from './utils/file'

(global as any).__BROWSER__ = false

function readFile(filepath: string) {
  return fs.readFileSync(filepath, 'utf-8')
}

it('test compile', async () => {
  const yaml = loadYamlFromPath(path.join(__dirname, 'fixtures/compile/cle.yaml'))
  if (!yaml)
    throw new Error('yaml is null')

  const sources = {
    ...webjson,
    'src/mapping.ts': readFile(path.join(__dirname, 'fixtures/compile/mapping.ts')),
    'src/cle.yaml': readFile(path.join(__dirname, 'fixtures/compile/cle.yaml')),
  }

  const outWasmPath = path.join(__dirname, 'fixtures/build/cle-compiletest.wasm')
  const outWatPath = path.join(__dirname, 'fixtures/build/cle-compiletest.wat')

  const result = await compile(sources, {
    // yamlPath: 'cle.yaml',
    outWasmPath,
    outWatPath,
    // compilerServerEndpoint: config.CompilerServerEndpoint,
  })
  if ((result?.stderr as any)?.length > 0)
    throw new Error(result?.stderr?.toString())
  expect(result.error).toBeNull()
  expect(objectKeys(result.outputs).length).toBeGreaterThanOrEqual(1)

  const wasmContent = result.outputs[outWasmPath]
  const watContent = result.outputs[outWatPath]
  expect(wasmContent).toBeDefined()
  expect(watContent).toBeDefined()
  createOnNonexist(outWasmPath)
  fs.writeFileSync(outWasmPath, wasmContent)
  fs.writeFileSync(outWatPath, watContent)

  // optional: output compile result for further exec test
  // let wasmPath = 'tests/build/cle-compiletest.wasm'
  // let watPath = 'tests/build/cle-compiletest.wat'
  // fs.writeFileSync(wasmPath, wasmContent)
  // fs.writeFileSync(watPath, watContent)
})
