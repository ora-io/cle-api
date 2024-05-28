import { describe, it } from 'vitest'
import { fixtures } from './fixureoptions'
import { testCompile } from './compile_test_impl'
import { testExecute } from './exec_test_impl'

(global as any).__BROWSER__ = false

const pathfromfixtures = 'dsp/ethereum(storage)'
// const pathfromfixtures = 'dsp/ethereum.unsafe-ethereum'
const option = fixtures[pathfromfixtures]

describe(`test dsp: ${pathfromfixtures}`, () => {
  it('test compile', async () => {
    await testCompile(option)
  }, { timeout: 100000 })

  it('test exec', async () => {
    await testExecute(option)
  }, { timeout: 100000 })
})
