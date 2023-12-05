import fs from 'node:fs'
import { it } from 'vitest'
import { ethers } from 'ethers'
import * as zkgapi from '../src/index'
import { config } from './config'

(global as any).__BROWSER__ = false

it('test publish', async () => {
  const ZkwasmProviderUrl = 'https://rpc.zkwasmhub.com:8090'
  const rpcUrl = config.JsonRpcProviderUrl.sepolia
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const userPrivateKey = config.UserPrivateKey
  const signer = new ethers.Wallet(userPrivateKey, provider)
  const zkgraphYaml = zkgapi.ZkGraphYaml.fromYamlPath('tests/testsrc/zkgraph-dirty.yaml') as zkgapi.ZkGraphYaml
  const ipfsHash = '111'
  const newBountyRewardPerTrigger = 0
  const wasm = fs.readFileSync('tests/build/zkgraph_full.wasm')
  const wasmUint8Array = new Uint8Array(wasm)
  const publishTxHash = await zkgapi.publish(
    { wasmUint8Array, zkgraphYaml },
    ZkwasmProviderUrl,
    provider,
    ipfsHash,
    newBountyRewardPerTrigger,
    signer,
    true,
  )
  // eslint-disable-next-line no-console
  console.log(publishTxHash)
}, { timeout: 100000 })
