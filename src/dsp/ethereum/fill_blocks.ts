import type { providers } from 'ethers'
import { filterEvents } from '../../common/api_helper'
import { getRawTransaction } from '../../common/ethers_helper'
import { toHexString } from '../../common/utils'
import type { CLEYaml, EthereumDataSource } from '../../types'
import { logger } from '../../common'
import type { BlockPrep } from './blockprep'

export function fillInputBlocks(
  input: any,
  cleYaml: CLEYaml,
  blockPrepMap: Map<number, BlockPrep>, // Map<blocknum: i32, BlockPrep>
  blocknumOrder: any[], // i32[]
  contextBlocknumber: number,
) {
  input = fillInputBlocksWithoutLatestBlockhash(
    input,
    cleYaml,
    blockPrepMap,
    blocknumOrder,
  )
  // Optional but easy to handle;
  // Public: blockhash_latest
  input.addInt(contextBlocknumber, true)
  return input
}

export function fillInputBlocksWithoutLatestBlockhash(
  input: any,
  cleYaml: CLEYaml,
  blockPrepMap: Map<number, BlockPrep>, // Map<blocknum: i32, BlockPrep>
  blocknumOrder: any[], // i32[]
) {
  const blockCount = blocknumOrder.length
  input.addInt(blockCount, 0) // block count

  blocknumOrder.forEach((bn: any) => {
    if (!blockPrepMap.has(bn))
      throw new Error(`Lack blockPrep for block (${bn})`)

    fillInputOneBlock(input, cleYaml, blockPrepMap.get(bn) as BlockPrep)
  })
  return input
}

// modularize, re-use in other dsp.
let fillInputStorageFunc = fillInputStorage
export function setFillInputStorageFunc(_func: any) {
  fillInputStorageFunc = _func
}

// modularize, re-use in other dsp.
let fillInputEventsFunc = fillInputEvents
export function setFillInputEventsFunc(_func: any) {
  fillInputEventsFunc = _func
}

// modularize, re-use in other dsp.
let fillInputTxsFunc = fillInputTxs
export function setFillInputTxsFunc(_func: any) {
  fillInputTxsFunc = _func
}

// blockPrep: class BlockPrep, used for prepare data & interface params.
export function fillInputOneBlock(input: any, cleYaml: CLEYaml, blockPrep: BlockPrep) {
  input.addInt(blockPrep.number, 0)

  // add timestamp
  input.addInt(blockPrep.timestamp, 0)
  // TODO: adjust this with lib
  // input.addVarLenHexString(
  //   // blockPrep?.rlpHeader,
  //   '00',
  //   false,
  // )

  /**
   * Fill storage
   * */
  const ds = cleYaml.getFilteredSourcesByKind('ethereum')[0] as unknown as EthereumDataSource
  if (ds.storage) {
    const [stateDSAddrList, stateDSSlotsList] = ds.getStorageLists()
    input.addInt(stateDSAddrList.length, false) // account count

    // TODO: move this to cli
    logger.log('[*] Defined Data Sources - Storage:')

    for (let i = 0; i < stateDSAddrList.length; i++) {
      // TODO move log to cli
      logger.log(
          `    (${i}) Address:`,
          stateDSAddrList[i],
          '\n        Slot keys:',
          stateDSSlotsList[i],
          '\n',
      )
    }
    fillInputStorageFunc(input, blockPrep, stateDSAddrList, stateDSSlotsList)
  }
  else {
    logger.log('[*] No storage DS provided, skip...') // can rm

    input.addInt(0, false) // account count
  }

  /**
   * Fill RLP(receipt)
   * */

  if (ds.event) {
    const [eventDSAddrList, eventDSEsigsList] = ds.getEventLists()

    logger.log('[*] Defined Data Sources - Event:')

    for (let i = 0; i < eventDSAddrList.length; i++)
      logger.log(`    (${i}) Address:`, eventDSAddrList[i], '\n        Event Sigs:', eventDSEsigsList[i], '\n')

    fillInputEventsFunc(input, blockPrep, eventDSAddrList, eventDSEsigsList)
  }
  else {
    logger.log('[*] No event DS provided, skip...') // can rm

    input.addInt(0, false) // source contract count; meaning: no source contract
  }

  if (ds.transaction) {
    logger.log('[*] Defined Data Sources - Transaction.')

    fillInputTxsFunc(input, blockPrep, ds.transaction)
  }
  else {
    logger.log('[*] No transaction DS provided, skip...')

    input.addInt(0, false) // tx count
  }

  return input
}

export function fillInputStorage(input: any, blockPrep: BlockPrep, stateDSAddrList: string[], stateDSSlotsList: string[][]) {
  for (let i = 0; i < stateDSAddrList.length; i++) {
    input.addHexString(stateDSAddrList[i], false) // address

    const acctPrep = blockPrep?.getAccount(stateDSAddrList[i])

    input.addVarLenHexString(acctPrep?.rlpNode, false) // account rlp
    // input.addVarLenHexStringArray(acctPrep?.accountProof, false) // account proof

    const sourceSlots = stateDSSlotsList[i]
    input.addInt(sourceSlots.length, false) // slot count

    for (let j = 0; j < sourceSlots.length; j++) {
      const slotPrep = acctPrep?.getSlot(sourceSlots[j])
      // slot might doesn't exist. can't proceed in this case.
      if (!slotPrep || slotPrep.storageProof == null)
        throw new Error(`In ExecInputGen: slot ${sourceSlots[j]} doesn't exist on given block height, storage proof == null. \n Please update yaml or use later blocknumber.`)

      input.addHexString(sourceSlots[j], false)
      input.addVarLenHexString(slotPrep.value, false)
      // input.addVarLenHexStringArray(slotPrep.storageProof, false)
    }
  }
}

export function fillInputEvents(input: any, blockPrep: BlockPrep, eventDSAddrList: string[], eventDSEsigsList: string[][]) {
  const rawreceiptList = blockPrep?.getReceiptRLPs()

  // TODO: return list rather than appending string.
  // NODE: rm `matchedEventOffsets` already. please add it yourself.
  const filteredRawReceiptIndexList = blockPrep.getFilterReceiptsIdx()
  const [rawReceipts, ,] = filterEvents(
    eventDSAddrList,
    eventDSEsigsList,
    rawreceiptList as any,
  )

  const receiptCount = filteredRawReceiptIndexList.length
  input.addInt(receiptCount, false) // receipt count (tmp)

  if (receiptCount > 0) {
    const trie = blockPrep.receiptTrie
    for (let i = 0; i < receiptCount; i++) {
      const idx = filteredRawReceiptIndexList[i]
      // fill mpt key
      input.addVarLenHexString(trie.keys[idx], 0)
      // fill mpt lastNodeHash
      const prf = trie.proof.get(idx)
      if (!prf)
        throw new Error(`missing receipt proof in Trie cache (idx: ${idx})`)
      input.addHexString(trie.lastNodeRlpHash(prf), 0)
      // fill receipt rlp len
      input.addInt(rawreceiptList[idx].length, 0)
    }

    // fill raw receipts
    input.addVarLenHexString(toHexString(rawReceipts), false)
  }
}

export function fillInputTxs(input: any, blockPrep: BlockPrep, txDSList: any[]) {
  const filteredTransactions = blockPrep.transactions.filter((transaction) => {
    const matchingTransactionItem = txDSList?.find((item) => {
      return (item.from === transaction.from || item.from === '*') && (item.to === transaction.to || item.to === '*')
    })
    return matchingTransactionItem
  })

  // TODO: move this to cli
  logger.log(`[*] ${filteredTransactions.length} transaction matched.`)
  for (let i = 0; i < filteredTransactions.length; i++)
    logger.log(`    (${i}) Hash:`, filteredTransactions[i].hash)

  input.addInt(filteredTransactions.length, false) // tx count
  for (const tx of filteredTransactions) {
    const hash = tx.hash
    // const index = blockPrep.transactions.findIndex(transaction => transaction.hash === tx.hash)
    input.addHexString(hash, false)
    input.addHexString(tx.from, false)
    const rawTx = getRawTransaction(tx)
    input.addVarLenHexString(rawTx, false)

    const offsets = calcTxFieldOffset(tx, rawTx)
    for (const offset of offsets)
      input.addInt(offset, false)
  }
}

function calcTxFieldOffset(tx: providers.TransactionResponse, raw: string): number[] {
  const rawTx = raw.substring(2)
  const hexNonce = tx.nonce.toString(16)
  const nonceOffset = rawTx.indexOf(hexNonce) / 2
  const nonceLen = hexNonce.length
  const offsets: number[] = [nonceOffset, nonceLen / 2]

  let toOffset = 0
  if (tx.to != null) {
    const toAddr = tx.to.toLowerCase().substring(2)
    toOffset = rawTx.indexOf(toAddr) / 2
  }
  offsets.push(toOffset)

  let dataOffset = 0
  if (tx.data !== '0x')
    dataOffset = rawTx.indexOf(tx.data.substring(2)) / 2

  const dataLen = tx.data.length - 2
  offsets.push(dataOffset)
  offsets.push(dataLen / 2)

  const rOffset = tx.r ? rawTx.indexOf(tx.r?.substring(2)) / 2 : 0
  const sOffset = tx.s ? rawTx.indexOf(tx.s?.substring(2)) / 2 : 0
  offsets.push(rOffset - 1)
  offsets.push(rOffset)
  offsets.push(sOffset)

  // console.log(offsets) // nonce offset, nonce len, to offset, data offset, data len, v offset, r offset, r len

  return offsets
}
