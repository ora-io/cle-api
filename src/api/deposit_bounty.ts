import { Contract, ethers } from 'ethers'
import {
  cleContractABI,
} from '../common/constants'

/**
 * @param {number} depositAmount - the deposit amount in ETH
 */
interface DepositOptions {
  depositAmount: string
}
/**
 * Publish and register CLE onchain.
 * @param {Signer} signer - the acct for sign tx
 * @param {string} cleContractAddress - the deployed verification contract address
 * @param options
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function deposit(
  cleContractAddress: string,
  signer: ethers.Signer,
  options: DepositOptions,
) {
  const { depositAmount } = options

  const cleContract = new Contract(cleContractAddress, cleContractABI, signer)
  const tx = await cleContract
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
