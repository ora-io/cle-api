import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { objectKeys } from '@murongg/utils'
import webjson from '@ora-io/cle-lib/test/weblib/weblib.json'
import { DEFAULT_PATH } from '../src/common/constants'
import * as cleapi from '../src/index'
import { loadYamlFromPath } from './utils/yaml'
import { createOnNonexist } from './utils/file'
import { fixtures } from './fixureoptions'
import { config } from './config'

(global as any).__BROWSER__ = false

function readFile(filepath: string) {
  return fs.readFileSync(filepath, 'utf-8')
}

// const pathfromfixtures = 'dsp/ethereum(storage)'
const pathfromfixtures = 'dsp/ethereum(event)'
// const pathfromfixtures = 'dsp/ethereum.unsafe'
const option = fixtures[pathfromfixtures]

describe('test compile', async () => {
  it('test compile', async () => {
    await testCompile(option)
  }, { timeout: 100000 })
})

export async function testCompile(option: any) {
  const { mappingPath, yamlPath, wasmPath, watPath } = option
  const cleYaml = loadYamlFromPath(yamlPath)
  if (!cleYaml)
    throw new Error('yaml is null')

  const sources = {
    ...webjson,
    'src/mapping.ts': readFile(mappingPath),
    'src/cle.yaml': readFile(yamlPath),
  }

  const result = await cleapi.compile(sources, { compilerServerEndpoint: config.CompilerServerEndpoint })

  if ((result?.stderr as any)?.length > 0)
    throw new Error(result?.stderr?.toString())

  expect(result.error).toBeNull()
  expect(objectKeys(result.outputs).length).toBeGreaterThanOrEqual(1)
  const wasmContent = result.outputs[DEFAULT_PATH.OUT_WASM]
  const watContent = result.outputs[DEFAULT_PATH.OUT_WAT]
  expect(wasmContent).toBeDefined()
  expect(watContent).toBeDefined()

  // optional: output compile result for further exec test
  createOnNonexist(wasmPath)
  fs.writeFileSync(wasmPath, wasmContent)
  fs.writeFileSync(watPath, watContent)
}
