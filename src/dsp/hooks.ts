import type { providers } from 'ethers'
import { getBlock, getBlockWithTxs, getProof, getRawReceipts } from '../common/ethers_helper'

export type DSPHookKeys = 'getBlock' | 'getProof' | 'getRawReceipts' | 'getBlockWithTxs' | 'getBlockNumber'
export type DSPHooks = Record<DSPHookKeys, (...args: any[]) => any>

const DSP_HOOKS_DATA_CACHE_SIZE_LIMIT = 10
export class DspHooksDataCache {
  blockMap: Map<string, any>
  rawReceiptsMap: Map<string, any>
  blockWithTxsMap: Map<string, any>
  constructor() {
    this.blockMap = new Map<string, any>()
    this.rawReceiptsMap = new Map<string, any>()
    this.blockWithTxsMap = new Map<string, any>()
  }

  setBlock(provider: string, blockid: string, block: any) {
    this.cleanupExpiredKeys(this.blockMap)
    const blockKey = `${provider}_${blockid}`
    this.blockMap.set(blockKey, block)
  }

  hasBlock(provider: string, blockid: string): boolean {
    const blockKey = `${provider}_${blockid}`
    return this.blockMap.has(blockKey)
  }

  getBlock(provider: string, blockid: string): any {
    const blockKey = `${provider}_${blockid}`
    return this.blockMap.get(blockKey)
  }

  setRawReceipts(provider: string, blockid: string, useDebugRPC: boolean, rawReceipts: any) {
    this.cleanupExpiredKeys(this.rawReceiptsMap)
    const rawReceiptsKey = `${provider}_${blockid}_${useDebugRPC}`
    this.rawReceiptsMap.set(rawReceiptsKey, rawReceipts)
  }

  hasRawReceipts(provider: string, blockid: string, useDebugRPC: boolean): boolean {
    const rawReceiptsKey = `${provider}_${blockid}_${useDebugRPC}`
    return this.rawReceiptsMap.has(rawReceiptsKey)
  }

  getRawReceipts(provider: string, blockid: string, useDebugRPC: boolean): any {
    const rawReceiptsKey = `${provider}_${blockid}_${useDebugRPC}`
    return this.rawReceiptsMap.get(rawReceiptsKey)
  }

  setBlockWithTxs(provider: string, blockid: string, blockWithTxs: any) {
    this.cleanupExpiredKeys(this.blockWithTxsMap)
    const blockWithTxsKey = `${provider}_${blockid}`
    this.blockWithTxsMap.set(blockWithTxsKey, blockWithTxs)
  }

  hasBlockWithTxs(provider: string, blockid: string): boolean {
    const blockWithTxsKey = `${provider}_${blockid}`
    return this.blockWithTxsMap.has(blockWithTxsKey)
  }

  getBlockWithTxs(provider: string, blockid: string): any {
    const blockWithTxsKey = `${provider}_${blockid}`
    return this.blockWithTxsMap.get(blockWithTxsKey)
  }

  cleanupExpiredKeys(map: Map<string, any>): void {
    const size = map.size
    if (size <= DSP_HOOKS_DATA_CACHE_SIZE_LIMIT)
      return

    const keys = map.keys()
    for (let i = DSP_HOOKS_DATA_CACHE_SIZE_LIMIT; i < size; i++) {
      const key = keys.next().value
      map.delete(key)
    }
  }
}

export const dspDataCache = new DspHooksDataCache()
/**
 * modify hooks
 * dspHooks.getBlock = () => {
 *    // do something
 * }
 */
export const dspHooks: DSPHooks = {
  getBlock: (ethersProvider: providers.JsonRpcProvider, blockid: string): Promise<any> => {
    if (dspDataCache.hasBlock(ethersProvider.connection.url, blockid))
      return Promise.resolve(dspDataCache.getBlock(ethersProvider.connection.url, blockid) as any)

    return getBlock(ethersProvider, blockid).then((block: any): any => {
      dspDataCache.setBlock(ethersProvider.connection.url, blockid, block)
      return block
    })
  },
  getProof: (ethersProvider: providers.JsonRpcProvider, address: string, keys: any[], blockid: string) => {
    return getProof(ethersProvider, address, keys, blockid)
  },
  getRawReceipts: (ethersProvider: providers.JsonRpcProvider, blockid: string | number, useDebugRPC = false): Promise<any> => {
    if (dspDataCache.hasRawReceipts(ethersProvider.connection.url, blockid.toString(), useDebugRPC))
      return Promise.resolve(dspDataCache.getRawReceipts(ethersProvider.connection.url, blockid.toString(), useDebugRPC))

    return getRawReceipts(ethersProvider, blockid, useDebugRPC).then((rawReceipts: any): any => {
      dspDataCache.setRawReceipts(ethersProvider.connection.url, blockid.toString(), useDebugRPC, rawReceipts)
      return rawReceipts
    })
  },
  getBlockWithTxs: (ethersProvider: providers.JsonRpcProvider, blockNumber: number): Promise<any> => {
    if (dspDataCache.hasBlockWithTxs(ethersProvider.connection.url, blockNumber.toString()))
      return Promise.resolve(dspDataCache.getBlockWithTxs(ethersProvider.connection.url, blockNumber.toString()))

    return getBlockWithTxs(ethersProvider, blockNumber).then((blockWithTxs: any): any => {
      dspDataCache.setBlock(ethersProvider.connection.url, blockNumber.toString(), blockWithTxs)
      return blockWithTxs
    })
  },
  getBlockNumber: (ethersProvider: providers.JsonRpcProvider) => {
    return ethersProvider.getBlockNumber()
  },
}

// Pointer, can also modify this by modify dspHooks.getBlock
// export const getBlock = dspHooks.getBlock
