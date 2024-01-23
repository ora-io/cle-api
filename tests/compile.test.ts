import path from 'path'
import fs from 'fs'
import { expect, it } from 'vitest'
import { objectKeys } from '@murongg/utils'
import webjson from '@hyperoracle/cle-lib-test/test/weblib/weblib.json'
import { compile } from '../src/api/compile'
import { loadYamlFromPath } from './utils/yaml'

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
    'mapping.ts': readFile(path.join(__dirname, 'fixtures/compile/mapping.ts')),
    'cle.yaml': readFile(path.join(__dirname, 'fixtures/compile/cle.yaml')),
  }

  const cleExecutable = {
    cleYaml: yaml,
  }

  const result = await compile(cleExecutable, sources)
  expect(result.error).toBeNull()
  expect(objectKeys(result.outputs).length).toBeGreaterThanOrEqual(1)

  const wasmContent = result.outputs['inner_pre_pre.wasm']
  const watContent = result.outputs['inner_pre_pre.wat']
  expect(wasmContent).toBeDefined()
  expect(watContent).toBeDefined()

  // optional: output compile result for further exec test
  // let wasmPath = 'tests/build/cle-compiletest.wasm'
  // let watPath = 'tests/build/cle-compiletest.wat'
  // fs.writeFileSync(wasmPath, wasmContent)
  // fs.writeFileSync(watPath, watContent)
})
