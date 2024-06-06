import { describe } from 'node:test'
import { it } from 'vitest'
import { ethers } from 'ethers'
import * as cleapi from '../src/index'
import { loadYamlFromPath } from './utils/yaml'
import { config } from './config'
import { fixtures } from './fixtures/fixureoptions'

(global as any).__BROWSER__ = false

const fixtureKey = config.fixture
const option = fixtures[fixtureKey]
const proveTaskId = config.proveTaskId

// TODO: use a reward == 0 cle to pass trigger test

describe('test trigger', () => {
  it('eth ddp', async () => {
    const { yamlPath } = option
    const yaml = loadYamlFromPath(yamlPath)

    const proofParams = await cleapi.getVerifyProofParamsByTaskID(config.ZkwasmProviderUrl, proveTaskId)
    const CLEID = '0x8fd9e85b23d3777993ebf04ad3a3b0878f7fee77'
    const userPrivateKey = config.UserPrivateKey
    const rpcUrl = config.JsonRpcProviderUrl.sepolia
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(userPrivateKey, provider)
    const ddpParams = { signer, gasLimit: 10000000, onlyMock: true }
    await cleapi.trigger(
      { cleYaml: yaml },
      CLEID,
      proofParams,
      [ddpParams], // 1 ddpParams per ddp
    )
  }, 100000)
})
