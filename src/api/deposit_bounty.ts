/* eslint-disable no-console */
import { Contract, Wallet, ethers, providers } from 'ethers'
import {
  graph_abi,
} from '../common/constants'
import { logLoadingAnimation } from '../common/log_utils'

/**
 * Publish and register zkGraph onchain.
 * @param {providers.JsonRpcProvider} provider - the provider of the target network
 * @param {object} signer - the acct for sign tx
 * @param {string} deployedContractAddress - the deployed verification contract address
 * @param {number} depositAmount - the deposit amount in ETH
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function deposit(
  provider: providers.JsonRpcProvider,
  signer: ethers.Wallet | string,
  deployedContractAddress: string,
  depositAmount: string,
  enableLog = true,
) {
  const graphContract = new Contract(deployedContractAddress, graph_abi, provider).connect(signer)
  const tx = await graphContract
    .deposit(
      ethers.utils.parseEther(depositAmount), { value: ethers.utils.parseEther(depositAmount) },
    )
    .catch((err: any) => {
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
