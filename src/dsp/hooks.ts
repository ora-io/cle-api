import type { providers } from 'ethers'
import { getBlock, getBlockWithTxs, getProof, getRawReceipts } from '../common/ethers_helper'

export type DSPHookKeys = 'getBlock' | 'getProof' | 'getRawReceipts' | 'getBlockWithTxs' | 'getBlockNumber'
export type DSPHooks = Record<DSPHookKeys, (...args: any[]) => any>

/**
 * modify hooks
 * dspHooks.getBlock = () => {
 *    // do something
 * }
 */
export const dspHooks: DSPHooks = {
  getBlock: (ethersProvider: providers.JsonRpcProvider, blockid: string) => {
    return getBlock(ethersProvider, blockid)
  },
  getProof: (ethersProvider: providers.JsonRpcProvider, address: string, keys: any[], blockid: string) => {
    return getProof(ethersProvider, address, keys, blockid)
  },
  getRawReceipts: (ethersProvider: providers.JsonRpcProvider, blockid: string | number, useDebugRPC = false) => {
    return getRawReceipts(ethersProvider, blockid, useDebugRPC)
  },
  getBlockWithTxs: (ethersProvider: providers.JsonRpcProvider, blockNumber: number) => {
    return getBlockWithTxs(ethersProvider, blockNumber)
  },
  getBlockNumber: (ethersProvider: providers.JsonRpcProvider) => {
    return ethersProvider.getBlockNumber()
  },
}

// Pointer, can also modify this by modify dspHooks.getBlock
// export const getBlock = dspHooks.getBlock
