import { describe, it } from 'vitest'
import { ethers } from 'ethers'
import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import * as zkgapi from '../src/index'
import { u32ListToUint8Array } from '../src/common/utils'
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
    res
    // console.log(res)
  }, { timeout: 100000 })

  it('u32ListToUint8Array', async () => {
    const blocknums = [5353087, 5353088]
    const result = u32ListToUint8Array(blocknums, 32)
    console.log('test u32ListToUint8Array', result)
    const extra = ZkWasmUtil.bytesToBigIntArray(result)
    console.log('test u32ListToUint8Array extra', extra)
    // expect(result).equals(new Uint8Array([ 127, 174, 81, 0 ])) // imcomplete
  })
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
