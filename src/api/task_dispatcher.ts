import type { providers } from 'ethers'
import { ethers } from 'ethers'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import { polling } from '@murongg/utils'
import { InsufficientBalance, TDNoTaskFound } from '../common/error'

axiosRetry(axios, {
  retries: 5,
  retryDelay: (retryCount) => {
    return retryCount * 2000
  },
})

const ABI = [
  'function setup(string memory imageId, uint256 circuitSize) payable',
  'function prove(string memory imageId, string memory privateInput, string memory publicInput) payable',
]

export interface QueryTaskResponse {
  task?: {
    id?: string
    type: 'setup' | 'prove'
    status: 'processing' | 'submitted'
  }
}

export class TaskDispatch {
  queryAPI: string
  feeInWei: ethers.BigNumber
  dispatcherContract: ethers.Contract
  constructor(queryAPI: string, contractAddress: string, feeInWei: ethers.BigNumber, provider: providers.JsonRpcProvider, signer: ethers.Wallet | ethers.providers.Provider | string) {
    this.queryAPI = queryAPI
    this.feeInWei = feeInWei
    this.dispatcherContract = new ethers.Contract(contractAddress, ABI, provider).connect(signer)
  }

  /**
     * Query task id by txhash.
     */
  async queryTask(txhash: string) {
    let res: QueryTaskResponse | undefined
    const request = async () => {
      const response = await axios.get<QueryTaskResponse>(`${this.queryAPI}/task?txhash=${txhash}`)
      const data = response.data
      if (data.task?.status === 'submitted') {
        res = data
        return true
      }
      return false
    }
    await polling(request, 1000)
    if (!res?.task?.id && res?.task?.status === 'submitted')
      throw new TDNoTaskFound('No corresponding task found for the transaction')

    return res as QueryTaskResponse
  }

  /**
     * Setup wasm iamge.
     * @param {string} imageId
     * @param {number} circuitSize
     * @returns {Promise<ethers.ContractTransaction>}
     */
  async setup(imageId: string, circuitSize: number) {
    const balance = await this.dispatcherContract.signer.getBalance()
    if (balance.lt(this.feeInWei))
      throw new InsufficientBalance('Insufficient balance in the connect wallet.')

    const tx = await this.dispatcherContract.setup(imageId, circuitSize, {
      value: this.feeInWei,
    })
    return tx
  }

  /**
     * Prove task.
     * @param {string} imageId
     * @param {string} privateInput
     * @param {string} publicInput
     * @returns {Promise<ethers.ContractTransaction>}
     */
  async prove(imageId: string, privateInput: string, publicInput: string) {
    const balance = await this.dispatcherContract.signer.getBalance()
    if (balance.lt(this.feeInWei))
      throw new InsufficientBalance('Insufficient balance in the connect wallet.')

    const tx = await this.dispatcherContract.prove(imageId, privateInput, publicInput, {
      value: this.feeInWei,
    })
    return tx
  }
}
