/* eslint-disable no-console */
import { ethers } from 'ethers'

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from '../index.js'

const rpcUrl = 'https://rpc.ankr.com/eth_sepolia'
const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
const userPrivateKey = ''
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
console.log(publishTxHash)
