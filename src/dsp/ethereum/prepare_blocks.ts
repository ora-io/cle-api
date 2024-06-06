import type { providers } from 'ethers'
import { ethers } from 'ethers'
import { RLP } from '@ethereumjs/rlp'
import { safeHex, uint8ArrayToHex } from '../../common/utils'
import type { CLEYaml, EthereumDataSource } from '../../types'
import { dspHooks } from '../hooks'
import { filterEvents } from '../../common/api_helper'
import { BlockPrep, EthereumDataPrep } from './blockprep'
import { MPTTrie } from './trie'

export async function prepareBlocksByYaml(provider: providers.JsonRpcProvider, contextBlocknumber: number, expectedStateStr: string, cleYaml: CLEYaml) {
  const blockPrepMap = new Map()

  // TODO: multi blocks
  const blocknumOrder = [contextBlocknumber]

  await Promise.all(blocknumOrder.map(async (bn) => {
    const blockPrep = await prepareOneBlockByYaml(provider, bn, cleYaml)
    blockPrepMap.set(bn, blockPrep)
  }))

  const latestBlocknumber = await dspHooks.getBlockNumber(provider) // used to decide recent blocks / bho blocks

  return new EthereumDataPrep(blockPrepMap, blocknumOrder, contextBlocknumber, expectedStateStr, latestBlocknumber)
}

// modularize prepareOneBlockFunc, re-use in other dsp.
let prepareOneBlockFunc = prepareOneBlock
export function setPrePareOneBlockFunc(_func: any) {
  prepareOneBlockFunc = _func
}

export async function prepareOneBlockByYaml(provider: providers.JsonRpcProvider, blockNumber: any, cleYaml: CLEYaml) {
  // let stateDSAddrList, stateDSSlotsList
  const ds = cleYaml.getFilteredSourcesByKind('ethereum')[0] as unknown as EthereumDataSource

  const [stateDSAddrList, stateDSSlotsList] = ds.storage ? ds.getStorageLists() : [[], []]
  const [eventDSAddrList, eventDSEsigsList] = ds.event ? ds.getEventLists() : [[], []]

  const needTransactions = ds.transaction != null

  // return await prepareOneBlockFunc(provider, blockNumber, stateDSAddrList, stateDSSlotsList, needRLPReceiptList, needTransactions)
  return await prepareOneBlockFunc(provider, blockNumber, stateDSAddrList, stateDSSlotsList, eventDSAddrList, eventDSEsigsList, needTransactions)
}

// export async function prepareOneBlock(provider: providers.JsonRpcProvider, blockNumber: number, stateDSAddrList: any[], stateDSSlotsList: any[][], needRLPReceiptList: boolean, needTransactions: boolean) {
export async function prepareOneBlock(
  provider: providers.JsonRpcProvider,
  blockNumber: number,
  stateDSAddrList: string[],
  stateDSSlotsList: string[][],
  eventDSAddrList: string[],
  eventDSEsigsList: string[][],
  needTransactions: boolean) {
  // let [stateDSAddrList, stateDSSlotsList] = [stateDSAddrList, stateDSSlotsList]
  const rawblock = await dspHooks.getBlock(provider, blockNumber)
  const block = new BlockPrep(rawblock)

  /**
   * prepare storage data
   */

  for (let i = 0; i < stateDSAddrList.length; i++) {
    // request
    const ethproof = await dspHooks.getProof(
      provider,
      stateDSAddrList[i],
      stateDSSlotsList[i],
      ethers.utils.hexValue(blockNumber),
    )

    if (ethproof.balance === '0x0')
      ethproof.balance = ''

    if (ethproof.nonce === '0x0')
      ethproof.nonce = ''

    const nestedList = [
      Buffer.from(safeHex(ethproof.nonce), 'hex'),
      Buffer.from(safeHex(ethproof.balance), 'hex'),
      Buffer.from(safeHex(ethproof.storageHash), 'hex'),
      Buffer.from(safeHex(ethproof.codeHash), 'hex'),
    ]

    const accountRLP = uint8ArrayToHex(RLP.encode(nestedList))

    block.addFromGetProofResult(ethproof, accountRLP)
  }

  /**
   * prepare raw receipts data
   */
  if (eventDSAddrList.length > 0) {
    const rawreceiptList = await dspHooks.getRawReceipts(provider, blockNumber)

    // get filtered receipt index list
    const [, , filteredRawReceiptIndexList] = filterEvents(
      eventDSAddrList,
      eventDSEsigsList,
      rawreceiptList as any,
    )
    // cache trie proof for receipts since prove is an async process
    const trie = await new MPTTrie().build(rawreceiptList)
    for (let i = 0; i < filteredRawReceiptIndexList.length; i++) {
      const idx = filteredRawReceiptIndexList[i]
      await trie.prove(idx, true) // cache proof in trie
    }
    // cache all receipt rlp
    block.setReceiptRLPs(rawreceiptList)
    block.setReceiptTrie(trie)
  }

  // TODO: improve this, reduce getBlock times
  if (needTransactions) {
    const blockwithtxs = await dspHooks.getBlockWithTxs(provider, blockNumber)
    block.setTransactions(blockwithtxs.transactions)
  }

  return block
}
