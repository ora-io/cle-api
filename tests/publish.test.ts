import fs from 'node:fs'
import { Contract, ethers } from 'ethers'
import { expect, it } from 'vitest'
import { CLEAlreadyExist } from '../src/common/error'
import * as cleapi from '../src/index'
import { DEFAULT_URL, abiFactory, addressFactory, cleContractABI } from '../src/common/constants'
import { config } from './config'
import { loadYamlFromPath } from './utils/yaml'
import { fixtures } from './fixureoptions'

(global as any).__BROWSER__ = false

const pathfromfixtures = 'dsp/ethereum(storage)'
// const pathfromfixtures = 'dsp/ethereum.unsafe-ethereum'
const option = fixtures[pathfromfixtures]

// enable this to silence logs
// cleapi.setCLELogger(new cleapi.SilentLogger())

it.skip('test publish', async () => {
  const { wasmPath, yamlPath } = option
  const cleYaml = loadYamlFromPath(yamlPath) as cleapi.CLEYaml
  const network = cleYaml.decidePublishNetwork()
  console.log('network', network)
  expect(network).toBeDefined()
  if (network === undefined)
    throw new Error('network is undefined')

  const rpcUrl = (config.JsonRpcProviderUrl as any)[network]

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const userPrivateKey = config.UserPrivateKey
  const signer = new ethers.Wallet(userPrivateKey, provider)
  const ipfsHash = Math.floor(Math.random() * (100000 - 0 + 1)).toString()
  const newBountyRewardPerTrigger = 0.01
  const wasm = fs.readFileSync(wasmPath)
  const wasmUint8Array = new Uint8Array(wasm)
  try {
  // proverUrl?: string,
    // ipfsHash: string,
    // bountyRewardPerTrigger: number,
    const publishTxHash = await cleapi.publish(
      { wasmUint8Array, cleYaml },
      signer,
      { proverUrl: DEFAULT_URL.ZKWASMHUB, ipfsHash, bountyRewardPerTrigger: newBountyRewardPerTrigger },
    )

    console.log('publishTxHash:', publishTxHash)
    // slice the last 40 digits of result.logs[2].data to a ethereum address
    // const address = "0x" + publishTxHash.logs[2].data.slice(-40);

    // console.log(address);

    const factoryContract = new Contract(addressFactory.sepolia, abiFactory, signer)
    const deployedAddress = await factoryContract.getCLEBycreator(signer.address)

    const cleContract = new Contract(deployedAddress[deployedAddress.length - 1], cleContractABI, provider).connect(signer)

    const reward = await cleContract.bountyReward()
    // expect reward is equal to newBountyRewardPerTrigger
    expect(reward).toEqual(ethers.utils.parseEther(newBountyRewardPerTrigger.toString()))
  }
  catch (error) {
    if (error instanceof CLEAlreadyExist)
      console.error('CLE already exist')
    else
      throw error
  }
}, { timeout: 100000 })
