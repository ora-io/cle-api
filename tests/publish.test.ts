import { it } from 'vitest'
import { ethers } from 'ethers'
import * as zkgapi from '../src/index'
import { config } from './config'

(global as any).__BROWSER__ = false

it('test publish', async () => {
  const rpcUrl = 'https://rpc.ankr.com/eth_sepolia'
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const userPrivateKey = config.UserPrivateKey
  const signer = new ethers.Wallet(userPrivateKey, provider)
  const zkgraphYaml = zkgapi.ZkGraphYaml.fromYamlPath('tests/testsrc/zkgraph-dirty.yaml')
  const ipfsHash = '111'
  const newBountyRewardPerTrigger = 0
  const publishTxHash = await zkgapi.publish(
    { wasmUint8Array: null, zkgraphYaml },
    provider,
    ipfsHash,
    newBountyRewardPerTrigger,
    signer,
    true,
  )
  // eslint-disable-next-line no-console
  console.log(publishTxHash)
}, { timeout: 100000 })
