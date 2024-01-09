/* eslint-disable no-console */
import { describe, it } from 'vitest'
import { ethers } from 'ethers'
import * as zkgapi from '../src/index'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'

(global as any).__BROWSER__ = false

describe('test utils', () => {
  it('test healthcheck', () => {
    test_healthcheck('tests/testsrc/cle-event.yaml')
    test_healthcheck('tests/testsrc/cle-storage.yaml')
    test_healthcheck('tests/testsrc/cle-dirty.yaml')
  })
  it('getRawReceipts', async () => {
    const provider = new ethers.providers.JsonRpcProvider(config.JsonRpcProviderUrl.sepolia)

    const res = await zkgapi.getRawReceipts(provider, 4818711, false)
    console.log(res)
  }, { timeout: 100000 })
})

function test_healthcheck(yamlPath: string) {
  try {
    const yaml1 = loadYamlFromPath(yamlPath) as any
    zkgapi.CLEYaml.healthCheck(yaml1)
    console.log('valid:', yamlPath)
  }
  catch (e) {
    console.log(e)
  }
}
