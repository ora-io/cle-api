import { describe } from 'node:test'
import { it } from 'vitest'
import { ethers } from 'ethers'
import * as zkgapi from '../src/index'
import { DEFAULT_URL } from '../src/common/constants'
import { loadYamlFromPath } from './utils/yaml'
import { config } from './config'

(global as any).__BROWSER__ = false

// const rpcUrl = 'https://rpc.ankr.com/eth_sepolia'

const yamlPath = 'tests/testsrc/cle-event.yaml'
// let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
const proveTaskId = '65dd7dad235cd47b5193efce' // true
// const proveTaskId = '655568eaadb2c56ffd2f0ee0' // fasle

// TODO: use a reward == 0 cle to pass trigger test

describe('test trigger', () => {
  const yaml = loadYamlFromPath(yamlPath)

  it('eth ddp', async () => {
    const proofParams = await zkgapi.getVerifyProofParamsByTaskID(DEFAULT_URL.ZKWASMHUB, proveTaskId)
    const CLEID = '0x8fd9e85b23d3777993ebf04ad3a3b0878f7fee77'
    const userPrivateKey = config.UserPrivateKey
    const rpcUrl = config.JsonRpcProviderUrl.sepolia
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(userPrivateKey, provider)
    const ddpParams = { signer, gasLimit: 10000000, onlyMock: true }
    await zkgapi.trigger(
      { cleYaml: yaml },
      CLEID,
      proofParams,
      [ddpParams], // 1 ddpParams per ddp
    )
  }, 100000)
})
