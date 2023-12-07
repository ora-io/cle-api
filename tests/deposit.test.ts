/* eslint-disable no-console */
import { it } from 'vitest'
import { ethers } from 'ethers'
import * as zkgapi from '../src/index'
import { config } from './config'

(global as any).__BROWSER__ = false

it('test deposit', async () => {
  const enableLog = true
  const rpcUrl = config.JsonRpcProviderUrl.sepolia
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const deployedContractAddress = '0x870ef9B5DcBB6F71139a5f35D10b78b145853e69'
  const depositAmount = '0.001'
  const userPrivateKey = config.UserPrivateKey
  const singer = new ethers.Wallet(userPrivateKey, provider)
  const result = await zkgapi.deposit(provider, singer, deployedContractAddress, depositAmount, enableLog)

  console.log(result)
}, { timeout: 100000 })
