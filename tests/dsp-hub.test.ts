import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CLEYaml } from '../src'
import { EthereumDataSourcePlugin } from '../src/dsp/ethereum'
import type { DSPHubForeignKeys } from '../src/dsp/hub'
import { DSPHub, dspHub } from '../src/dsp/hub'

const dspHub4test = new DSPHub()

describe('DSPHub', () => {
  it.only('print all dsp key', () => {
    console.log('dsp keys', dspHub.hub.keys())
  })
  beforeEach(() => {
    // Clear the hub before each test
    dspHub4test.hub.clear()
  })

  it('should set and get DSPs correctly', () => {
    const primaryKey = 'ethereum'
    const foreignKeys: DSPHubForeignKeys = { }
    // const foreignKeys: DSPHubForeignKeys = { isLocal: false }
    const dsp = new EthereumDataSourcePlugin()

    dspHub4test.setDSP(primaryKey, foreignKeys, dsp)

    expect(dspHub4test.getDSP(primaryKey, foreignKeys)).toBe(dsp)
  })

  it('should throw an error when getting a non-existent DSP', () => {
    const primaryKey = 'ethereum'
    const foreignKeys: DSPHubForeignKeys = { }
    // const foreignKeys: DSPHubForeignKeys = { isLocal: false }

    expect(() => {
      dspHub4test.getDSP(primaryKey, foreignKeys)
    }).toThrowError(`Data Source Plugin Hub Key "${primaryKey}" doesn't exist.`)
  })

  it('should get DSP by YAML correctly', () => {
    const cleYaml = {
      getSignificantKeys: vi.fn(() => [['ethereum']]),
    }
    const foreignKeys: DSPHubForeignKeys = { }
    // const foreignKeys: DSPHubForeignKeys = { isLocal: false }
    const dsp = new EthereumDataSourcePlugin()

    dspHub4test.setDSP('ethereum', foreignKeys, dsp)

    expect(dspHub4test.getDSPByYaml(cleYaml as unknown as CLEYaml, foreignKeys)).toBe(dsp)
  })
})
