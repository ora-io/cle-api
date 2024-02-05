import fs from 'node:fs'
import { Contract, ethers } from 'ethers'
import { expect, it } from 'vitest'
import { GraphAlreadyExist } from '../src/common/error'
import * as zkgapi from '../src/index'
import { abiFactory, addressFactory, graph_abi } from '../src/common/constants'
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
  const ipfsHash = Math.floor(Math.random() * (100000 - 0 + 1)).toString()
  const newBountyRewardPerTrigger = 0.01
  const wasm = fs.readFileSync('tests/build/cle_full.wasm')
  const wasmUint8Array = new Uint8Array(wasm)
  try {
    const publishTxHash = await zkgapi.publish(
      { wasmUint8Array, cleYaml },
      ZkwasmProviderUrl,
      ipfsHash,
      newBountyRewardPerTrigger,
      signer,
    )
    // eslint-disable-next-line no-console
    console.log(publishTxHash)
    // slice the last 40 digits of result.logs[2].data to a ethereum address
    // const address = "0x" + publishTxHash.logs[2].data.slice(-40);

    // console.log(address);

    const factoryContract = new Contract(addressFactory.sepolia, abiFactory, signer)
    const deployedAddress = await factoryContract.getGraphBycreator(signer.address)

    const graphContract = new Contract(deployedAddress[deployedAddress.length - 1], graph_abi, provider).connect(signer)

    const reward = await graphContract.bountyReward()
    // expect reward is equal to newBountyRewardPerTrigger
    expect(reward).toEqual(ethers.utils.parseEther(newBountyRewardPerTrigger.toString()))
  }
  catch (error) {
    if (error instanceof GraphAlreadyExist)
      console.error('Graph already exist')
    else
      throw error
  }
}, { timeout: 100000 })
