import path from 'path'
import fs from 'fs'
import { expect, it } from 'vitest'
import { objectKeys } from '@murongg/utils'
import webjson from '@hyperoracle/cle-lib/test/weblib/weblib.json'
import { compile } from '../src/api/compile'
import { loadYamlFromPath } from './utils/yaml'

(global as any).__BROWSER__ = false

function getMappingContent(filepath: string) {
  return fs.readFileSync(filepath, 'utf-8')
}

it('test compile', async () => {
  const yaml = loadYamlFromPath(path.join(__dirname, 'fixtures/compile/cle.yaml'))
  if (!yaml)
    throw new Error('yaml is null')

  const sources = {
    ...webjson,
    'mapping.ts': getMappingContent(path.join(__dirname, 'fixtures/compile/mapping.ts')),
  }

  const cleExecutable = {
    cleYaml: yaml,
  }

  const result = await compile(cleExecutable, sources)
  expect(result.error).toBeNull()
  expect(objectKeys(result.outputs).length).toBeGreaterThanOrEqual(1)
  expect(result.outputs['inner_pre_pre.wasm']).toBeDefined()
  expect(result.outputs['inner_pre_pre.wat']).toBeDefined()
})
