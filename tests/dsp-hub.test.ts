import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { DSPHubForeignKeys } from '../src/dsp/hub'
import { dspHub } from '../src/dsp/hub'
import { EthereumDataSourcePlugin } from '../src/dsp/ethereum'
import type { ZkGraphYaml } from '../src'

describe('DSPHub', () => {
  beforeEach(() => {
    // Clear the hub before each test
    dspHub.hub.clear()
  })

  it('should set and get DSPs correctly', () => {
    const primaryKey = 'ethereum'
    const foreignKeys: DSPHubForeignKeys = { isLocal: false }
    const dsp = EthereumDataSourcePlugin

    dspHub.setDSP(primaryKey, foreignKeys, dsp)

    expect(dspHub.getDSP(primaryKey, foreignKeys)).toBe(dsp)
  })

  it('should throw an error when getting a non-existent DSP', () => {
    const primaryKey = 'ethereum'
    const foreignKeys: DSPHubForeignKeys = { isLocal: false }

    expect(() => {
      dspHub.getDSP(primaryKey, foreignKeys)
    }).toThrowError(`Data Source Plugin Hub Key "${primaryKey}:full" doesn't exist.`)
  })

  it('should get DSP by YAML correctly', () => {
    const zkgraphYaml = {
      getSignificantKeys: vi.fn(() => [['ethereum']]),
    }
    const foreignKeys: DSPHubForeignKeys = { isLocal: false }
    const dsp = EthereumDataSourcePlugin

    dspHub.setDSP('ethereum', foreignKeys, dsp)

    expect(dspHub.getDSPByYaml(zkgraphYaml as unknown as ZkGraphYaml, foreignKeys)).toBe(dsp)
  })
})
