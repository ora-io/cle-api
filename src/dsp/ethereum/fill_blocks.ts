/* eslint-disable no-console */
import type { providers } from 'ethers'
import { filterEvents } from '../../common/api_helper'
import { getRawTransaction } from '../../common/ethers_helper'
import { toHexString } from '../../common/utils'
import type { ZkGraphYaml } from '../../types/zkgyaml'
import type { EthereumDataSource } from '../../types/zkgyaml_eth'
import type { BlockPrep } from './blockprep'

export function fillInputBlocks(
  input: any,
  zkgraphYaml: ZkGraphYaml,
  blockPrepMap: Map<number, BlockPrep>, // Map<blocknum: i32, BlockPrep>
  blocknumOrder: any[], // i32[]
  latestBlockhash: string,
) {
  const blockCount = blocknumOrder.length
  input.addInt(blockCount, false) // block count

  blocknumOrder.forEach((bn: any) => {
    if (!blockPrepMap.has(bn))
      throw new Error(`Lack blockPrep for block (${bn})`)

    fillInputOneBlock(input, zkgraphYaml, blockPrepMap.get(bn) as BlockPrep)
  })

  // Optional but easy to handle;
  // Public: blockhash_latest
  input.addHexString(latestBlockhash, true)

  return input
}

// blockPrep: class BlockPrep, used for prepare data & interface params.
export function fillInputOneBlock(input: any, zkgraphYaml: ZkGraphYaml, blockPrep: BlockPrep) {
  input.addInt(blockPrep.number, false)

  input.addVarLenHexString(
    blockPrep?.rlpHeader,
    false,
  )

  /**
   * Fill storage
   * */
  const ds = zkgraphYaml.getFilteredSourcesByKind('ethereum')[0] as unknown as EthereumDataSource
  if (ds.storage) {
    const [stateDSAddrList, stateDSSlotsList] = ds.getStorageLists()
    input.addInt(stateDSAddrList.length, false) // account count

    // TODO: move this to cli
    console.log('[*] Defined Data Sources - Storage:')
    for (let i = 0; i < stateDSAddrList.length; i++) {
      // TODO move log to cli
      console.log(
        `    (${i}) Address:`,
        stateDSAddrList[i],
        '\n        Slot keys:',
        stateDSSlotsList[i],
        '\n',
      )

      input.addHexString(stateDSAddrList[i], false) // address
      // let ethproof = await getProof(
      //   provider,
      //   stateDSAddrList[i],
      //   stateDSSlotsList[i],
      //   ethers.utils.hexValue(blockNumber)
      // );

      const acctPrep = blockPrep?.getAccount(stateDSAddrList[i])

      input.addVarLenHexString(acctPrep?.rlpNode, false) // account rlp
      input.addVarLenHexStringArray(acctPrep?.accountProof, false) // account proof

      const sourceSlots = stateDSSlotsList[i]
      input.addInt(sourceSlots.length, false) // slot count

      for (let j = 0; j < sourceSlots.length; j++) {
        const slotPrep = acctPrep?.getSlot(sourceSlots[j])
        // slot might doesn't exist. can't proceed in this case.
        if (slotPrep.storageProof == null)
          throw new Error(`In ExecInputGen: slot ${sourceSlots[j]} doesn't exist on given block height, storage proof == null. \n Please update yaml or use later blocknumber.`)

        input.addHexString(sourceSlots[j], false)
        input.addVarLenHexString(slotPrep.value, false)
        input.addVarLenHexStringArray(slotPrep.storageProof, false)
      }
    }
  }
  else {
    console.log('[*] No storage DS provided, skip...')
    input.addInt(0, false) // account count
  }

  /**
   * Fill RLP(receipt)
   * */

  if (ds.event) {
    // TODO move logs to cli
    const enableLog = true

    const [eventDSAddrList, eventDSEsigsList] = ds.getEventLists()

    // TODO: move this to cli
    console.log('[*] Defined Data Sources - Event:')
    for (let i = 0; i < eventDSAddrList.length; i++)
      console.log(`    (${i}) Address:`, eventDSAddrList[i], '\n        Event Sigs:', eventDSEsigsList[i], '\n')

    const rawreceiptList = blockPrep?.getRLPReceipts()

    // TODO: return list rather than appending string.
    // NODE: rm `matchedEventOffsets` already. please add it yourself.
    const [rawReceipts] = filterEvents(
      eventDSAddrList,
      eventDSEsigsList,
      rawreceiptList as any,
      enableLog,
    )

    // TODO: calc receipt count from filterEvents
    const receiptCount = (rawReceipts.length > 0 ? rawreceiptList?.length : 0) || 0
    input.addInt(receiptCount, false) // receipt count (tmp)

    if (receiptCount > 0) {
      // fill raw receipts
      input.addVarLenHexString(toHexString(rawReceipts), false)
    }
  }
  else {
    console.log('[*] No event DS provided, skip...')
    input.addInt(0, false) // source contract count; meaning: no source contract
  }

  if (ds.transaction) {
    // TODO: move this to cli
    console.log('[*] Defined Data Sources - Transaction.')

    const filteredTransactions = blockPrep.transactions.filter((transaction) => {
      const matchingTransactionItem = ds.transaction?.find((item) => {
        return (item.from === transaction.from || item.from === '*') && (item.to === transaction.to || item.to === '*')
      })
      return matchingTransactionItem
    })

    // TODO: move this to cli
    console.log(`[*] ${filteredTransactions.length} transaction matched.`)
    for (let i = 0; i < filteredTransactions.length; i++)
      console.log(`    (${i}) Hash:`, filteredTransactions[i].hash)

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
  else {
    console.log('[*] No transaction DS provided, skip...')
    input.addInt(0, false) // tx count
  }

  return input
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

  const rOffset = rawTx.indexOf(tx.r?.substring(2)) / 2
  const sOffset = rawTx.indexOf(tx.s?.substring(2)) / 2
  offsets.push(rOffset - 1)
  offsets.push(rOffset)
  offsets.push(sOffset)

  // console.log(offsets) // nonce offset, nonce len, to offset, data offset, data len, v offset, r offset, r len

  return offsets
}
