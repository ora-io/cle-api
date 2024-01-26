import { filterEvents } from '../../common/api_helper'
import { toHexString } from '../../common/utils'
import type { BlockPrep } from '../ethereum/blockprep'

export function unsafeFillInputEvents(input: any, blockPrep: BlockPrep, eventDSAddrList: string[], eventDSEsigsList: string[][]) {
  const rawreceiptList = blockPrep?.getRLPReceipts()

  // TODO move logs to cli
  const enableLog = true

  // TODO: return list rather than appending string.
  // NODE: rm `matchedEventOffsets` already. please add it yourself.
  const [rawReceipts, matchedEventOffsets] = filterEvents(
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

    input.addVarLenHexString(toHexString(new Uint8Array(matchedEventOffsets.buffer)))
  }
}
