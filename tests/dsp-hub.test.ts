import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CLEYaml } from '../src'
import { EthereumDataSourcePlugin } from '../src/dsp/ethereum'
import type { DSPHubForeignKeys } from '../src/dsp/hub'
import { dspHub } from '../src/dsp/hub'

describe('DSPHub', () => {
  beforeEach(() => {
    // Clear the hub before each test
    dspHub.hub.clear()
  })

  it('should set and get DSPs correctly', () => {
    const primaryKey = 'ethereum'
    const foreignKeys: DSPHubForeignKeys = { }
    // const foreignKeys: DSPHubForeignKeys = { isLocal: false }
    const dsp = new EthereumDataSourcePlugin()

    dspHub.setDSP(primaryKey, foreignKeys, dsp)

    expect(dspHub.getDSP(primaryKey, foreignKeys)).toBe(dsp)
  })

  it('should throw an error when getting a non-existent DSP', () => {
    const primaryKey = 'ethereum'
    const foreignKeys: DSPHubForeignKeys = { }
    // const foreignKeys: DSPHubForeignKeys = { isLocal: false }

    expect(() => {
      dspHub.getDSP(primaryKey, foreignKeys)
    }).toThrowError(`Data Source Plugin Hub Key "${primaryKey}" doesn't exist.`)
  })

  it('should get DSP by YAML correctly', () => {
    const cleYaml = {
      getSignificantKeys: vi.fn(() => [['ethereum']]),
    }
    const foreignKeys: DSPHubForeignKeys = { }
    // const foreignKeys: DSPHubForeignKeys = { isLocal: false }
    const dsp = new EthereumDataSourcePlugin()

    dspHub.setDSP('ethereum', foreignKeys, dsp)

    expect(dspHub.getDSPByYaml(cleYaml as unknown as CLEYaml, foreignKeys)).toBe(dsp)
  })
})
