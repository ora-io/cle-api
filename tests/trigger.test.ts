import { describe } from 'node:test'
import { it } from 'vitest'
import { ethers } from 'ethers'
import * as zkgapi from '../src/index'
import { loadYamlFromPath } from './utils/yaml'
import { config } from './config'

(global as any).__BROWSER__ = false

// const rpcUrl = 'https://rpc.ankr.com/eth_sepolia'

const yamlPath = 'tests/testsrc/cle-event.yaml'
// let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
const ZkwasmProviderUrl = 'https://rpc.zkwasmhub.com:8090'
// let proveTaskId = "6554584c82ab2c8b29dbc2c2" // true
const proveTaskId = '655568eaadb2c56ffd2f0ee0' // fasle

describe('test trigger', () => {
  const yaml = loadYamlFromPath(yamlPath)

  it('test verify proof params', async () => {
    const proofParams = await zkgapi.getVerifyProofParamsByTaskID(ZkwasmProviderUrl, proveTaskId)
    const CLEID = '0x870ef9B5DcBB6F71139a5f35D10b78b145853e69'
    const userPrivateKey = config.UserPrivateKey
    const rpcUrl = config.JsonRpcProviderUrl.sepolia
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const signer = new ethers.Wallet(userPrivateKey, provider)
    const ddpParams = { signer, gasLimit: 3000000 }
    await zkgapi.trigger(
      { cleYaml: yaml },
      CLEID,
      proofParams,
      [ddpParams], // 1 ddpParams per ddp
      true,
    )
  }, 100000)
})
