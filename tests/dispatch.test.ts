import { it } from 'vitest'
import { ethers } from 'ethers'
import * as cleapi from '../src/index'
import { config } from './config'

(global as any).__BROWSER__ = false

it('test dispatch', async () => {
  const queryAPI = 'https://zkwasm.hyperoracle.io/td'
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  const feeInWei = ethers.utils.parseEther('0.01')
  const rpcUrl = config.JsonRpcProviderUrl.sepolia
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const privateKey = config.UserPrivateKey
  const signer = new ethers.Wallet(privateKey, provider)

  const dispatcher = new cleapi.TaskDispatch(queryAPI, contractAddress, feeInWei, provider, signer)
  const tx = await dispatcher.setup('cle', 22)
  await tx.wait()

  const txhash = tx.hash
  console.log(txhash)

  const taskID = await dispatcher.queryTask(txhash)
  console.log(taskID)
}, { timeout: 100000 })
