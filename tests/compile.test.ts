import path from 'path'
import fs from 'fs'
import { expect, it } from 'vitest'
import { objectKeys, randomStr } from '@murongg/utils'
import webjson from '@hyperoracle/zkgraph-lib/test/weblib/weblib.json'
import { compile } from '../src/api/compile'
import { ZkGraphYaml, dspHub } from '../src'

(global as any).__BROWSER__ = false

function getMappingContent(filepath: string) {
  return fs.readFileSync(filepath, 'utf-8')
}

it('test compile', async () => {
  const yaml = ZkGraphYaml.fromYamlPath(path.join(__dirname, 'fixtures/compile/zkgraph.yaml'))
  if (!yaml)
    throw new Error('ERROR: Failed to get yaml')
  const dsp = dspHub.getDSPByYaml(yaml, { isLocal: false })
  if (!dsp)
    throw new Error('ERROR: Failed to get DSP')

  const libDSPName = dsp.getLibDSPName()
  const mappingFileName = yaml.mapping.file
  const handleFuncName = yaml.mapping.handler
  // Arrange
  const tsModule = `entry_${randomStr(10)}.ts`
  const sources = {
    ...webjson,
    'mapping.ts': getMappingContent(path.join(__dirname, 'fixtures/compile/mapping.ts')),
  }

  const result = await compile(tsModule, libDSPName, mappingFileName, handleFuncName, sources)
  expect(result.error).toBeNull()
  expect(objectKeys(result.outputs).length).toBeGreaterThanOrEqual(1)
  expect(result.outputs['inner_pre_pre.wasm']).toBeDefined()
  expect(result.outputs['inner_pre_pre.wat']).toBeDefined()
})
