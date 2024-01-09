import fs from 'node:fs'
import { ethers } from 'ethers'
import { it } from 'vitest'
import { GraphAlreadyExist } from '../src/common/error'
import * as zkgapi from '../src/index'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'

(global as any).__BROWSER__ = false

it('test publish', async () => {
  const ZkwasmProviderUrl = 'https://rpc.zkwasmhub.com:8090'
  const rpcUrl = config.JsonRpcProviderUrl.sepolia
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const userPrivateKey = config.UserPrivateKey
  const signer = new ethers.Wallet(userPrivateKey, provider)
  const cleYaml = loadYamlFromPath('tests/testsrc/cle-dirty.yaml') as zkgapi.CLEYaml
  const ipfsHash = '111'
  const newBountyRewardPerTrigger = 0
  const wasm = fs.readFileSync('tests/build/cle_full.wasm')
  const wasmUint8Array = new Uint8Array(wasm)
  try {
    const publishTxHash = await zkgapi.publish(
      { wasmUint8Array, cleYaml },
      ZkwasmProviderUrl,
      provider,
      ipfsHash,
      newBountyRewardPerTrigger,
      signer,
    )
    // eslint-disable-next-line no-console
    console.log(publishTxHash)
  }
  catch (error) {
    if (error instanceof GraphAlreadyExist)
      console.error('Graph already exist')
    else
      throw error
  }
}, { timeout: 100000 })
