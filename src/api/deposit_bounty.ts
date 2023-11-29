/* eslint-disable no-console */
import { Contract, Wallet, ethers, providers } from 'ethers'
import {
  graph_abi,
} from '../common/constants'
import { logLoadingAnimation } from '../common/log_utils'

/**
 * Publish and register zkGraph onchain.
 * @param {string} rpcUrl - the rpc url of the target network
 * @param {string} deployedContractAddress - the deployed verification contract address
 * @param {number} depositAmount - the deposit amount in ETH
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function deposit(
  rpcUrl: string,
  deployedContractAddress: string,
  depositAmount: string,
  userPrivateKey: string,
  enableLog = true,
) {
  const provider = new providers.JsonRpcProvider(rpcUrl)

  const wallet = new Wallet(userPrivateKey, provider)

  const graphContract = new Contract(deployedContractAddress, graph_abi, wallet)
  const tx = await graphContract
    .deposit(
      ethers.utils.parseEther(depositAmount), { value: ethers.utils.parseEther(depositAmount) },
    )
    .catch((err: any) => {
      throw err
    })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signedTx = await wallet.signTransaction(tx).catch((err: any) => {
    throw err
  })

  let loading
  if (enableLog === true) {
    console.log('[*] Please wait for deposit tx... (estimated: 30 sec)', '\n')
    loading = logLoadingAnimation()
  }

  const txReceipt = await tx.wait(1).catch((err: any) => {
    throw err
  })

  if (enableLog === true) {
    loading?.stopAndClear()
    console.log('[+] ZKGRAPH BOUNTY DEPOSIT COMPLETE!', '\n')
    console.log(
      `[*] Transaction confirmed in block ${txReceipt.blockNumber}`,
    )
    console.log(`[*] Transaction hash: ${txReceipt.transactionHash}`, '\n')
  }

  return txReceipt.transactionHash
}
