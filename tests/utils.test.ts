import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ethers } from 'ethers'
import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import yaml from 'js-yaml'
import * as cleapi from '../src/index'
import { u32ListToUint8Array } from '../src/common/utils'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'
import { fixtures } from './fixureoptions'

(global as any).__BROWSER__ = false

describe('test utils', () => {
  it('test healthcheck', () => {
    test_healthcheck(fixtures['dsp/ethereum(storage)'].yamlPath)
    test_healthcheck(fixtures['dsp/ethereum(event)'].yamlPath)
  })
  it('getRawReceipts', async () => {
    const provider = new ethers.providers.JsonRpcProvider(config.JsonRpcProviderUrl.sepolia)

    const res = await cleapi.getRawReceipts(provider, 4818711, false)
    res
    // console.log(res)
  }, { timeout: 100000 })

  it('u32ListToUint8Array', () => {
    const blocknums = [5353087, 5353088]
    const result = u32ListToUint8Array(blocknums, 32)
    // console.log('test u32ListToUint8Array', result)
    const extra = ZkWasmUtil.bytesToBigIntArray(result)
    console.log('test u32ListToUint8Array extra', extra)
    // expect(result).equals(new Uint8Array([ 127, 174, 81, 0 ])) // imcomplete
  })

  it('yaml filterSections', () => {
    const yaml = loadYamlFromPath('tests/testsrc/cle-event.yaml') as any
    expect(yaml.dataSources[0].filterByKeys(['event', 'storage']).event).toBeInstanceOf(Array)
  })
  it('yaml toString', () => {
    const yamlpath = 'tests/testsrc/cle-event.yaml'
    const yamlContents = fs.readFileSync(yamlpath, 'utf8')
    const expectedYamlDump = yaml.dump(yaml.load(yamlContents))

    const yamlObj = loadYamlFromPath(yamlpath) as any

    expect(yamlObj.toString()).equals(expectedYamlDump)
  })
})

function test_healthcheck(yamlPath: string) {
  try {
    const yaml1 = loadYamlFromPath(yamlPath) as any
    cleapi.CLEYaml.healthCheck(yaml1)
    console.log('valid:', yamlPath)
  }
  catch (e) {
    console.log(e)
  }
}
