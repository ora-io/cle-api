import { describe, it } from 'vitest'
import { fixtures } from './fixureoptions'
import { testCompile } from './compile.test'
import { testExecute } from './exec.test'

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
