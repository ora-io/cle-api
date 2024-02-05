import { Contract, ethers } from 'ethers'
import {
  graph_abi,
} from '../common/constants'

/**
 * Publish and register CLE onchain.
 * @param {providers.JsonRpcProvider} provider - the provider of the target network
 * @param {object} signer - the acct for sign tx
 * @param {string} graphContractAddress - the deployed verification contract address
 * @param {number} depositAmount - the deposit amount in ETH
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function deposit(
  signer: ethers.Signer,
  graphContractAddress: string,
  depositAmount: string,
) {
  const graphContract = new Contract(graphContractAddress, graph_abi, signer)
  const tx = await graphContract
    .deposit(
      ethers.utils.parseEther(depositAmount), { value: ethers.utils.parseEther(depositAmount) },
    )
    .catch((err: any) => {
      throw err
    })

  const txReceipt = await tx.wait(1).catch((err: any) => {
    throw err
  })

  return txReceipt as {
    transactionHash: string
    blockNumber: number
  }
}
