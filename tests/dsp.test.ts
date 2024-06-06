import { describe, it } from 'vitest'
import { fixtures } from './fixtures/fixureoptions'
import { testCompile } from './compile_test_impl'
import { testExecute } from './exec_test_impl'
import { config } from './config'

(global as any).__BROWSER__ = false

const fixtureKey = config.fixture
const option = fixtures[fixtureKey]

describe(`test dsp: ${fixtureKey}`, () => {
  it('test compile', async () => {
    await testCompile(option)
  }, { timeout: 100000 })

  it('test exec', async () => {
    await testExecute(option)
  }, { timeout: 100000 })
})
