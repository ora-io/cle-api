import { describe, it } from 'vitest'
import { fixtures } from './fixureoptions'
import { testCompile } from './compile_test_impl'

(global as any).__BROWSER__ = false

const pathfromfixtures = 'dsp/ethereum(storage)'
// const pathfromfixtures = 'dsp/ethereum(event)'
// const pathfromfixtures = 'dsp/ethereum.unsafe'
const option = fixtures[pathfromfixtures]

describe('test compile', async () => {
  it('test compile', async () => {
    await testCompile(option)
  }, { timeout: 100000 })
})
