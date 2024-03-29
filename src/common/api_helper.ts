import { logReceiptAndEvents } from './log_utils'
import { fromHexString, trimPrefix } from './utils'
import { TxReceipt } from './tx_receipt'
import type { Event } from './event'

function eventTo7Offsets(event: Event, receiptBaseOffset: number) {
  const rst = [event.address_offset[0] + receiptBaseOffset]

  for (let i = 0; i < 4; i++) {
    rst.push(
      i < event.topics.length
        ? (event as any).topics_offset[i][0] + receiptBaseOffset
        : 0,
    )
  }

  rst.push(event.data_offset[0] + receiptBaseOffset)
  rst.push(event.data.length)
  return rst
}

function cleanReceipt(r: string) {
  return trimPrefix(trimPrefix(r, '0x'), '02')
}

export function rlpDecodeAndEventFilter(rawreceiptList: any, srcAddrList: any, srcEsigsList: any) {
  const filteredRawReceiptList = []
  const filteredEventsList = []

  for (const i in rawreceiptList) {
    const es = TxReceipt.fromRawStr(rawreceiptList[i]).filter(
      srcAddrList,
      srcEsigsList,
    )
    if (es.length > 0) {
      filteredRawReceiptList.push(rawreceiptList[i])
      filteredEventsList.push(es)
    }
  }
  return [filteredRawReceiptList, filteredEventsList]
}

export function genStreamAndMatchedEventOffsets(rawreceiptList: any[], eventList: any[]): [Uint8Array, any[]] {
  let matched_offset_list: any[] = []
  let accumulateReceiptLength = 0
  let rawreceipts = ''

  if (rawreceiptList.length !== eventList.length)
    throw new Error('rawreceiptList and eventList should have same length.')

  for (const rcpid in rawreceiptList) {
    const es = eventList[rcpid]
    matched_offset_list = matched_offset_list.concat(
      ...es.map((e: Event) => eventTo7Offsets(e, accumulateReceiptLength)),
    )

    const r = cleanReceipt(rawreceiptList[rcpid])
    rawreceipts += r

    accumulateReceiptLength += Math.ceil(r.length / 2)
  }

  return [fromHexString(rawreceipts), matched_offset_list]
}

// Format inputs with length and input value
export function formatIntInput(input: number) {
  return `0x${input.toString(16)}:i64 `
}

// Format bytes input
export function formatHexStringInput(input: string) {
  return `0x${trimPrefix(input, '0x')}:bytes-packed `
}

// Format inputs with length and input value
export function formatVarLenInput(input: string) {
  //   var formatted = "";
  //   inputs.map((input) => {
  //     var inp = trimPrefix(input, '0x')
  //     formatted += `${formatIntInput(Math.ceil(inp.length / 2))}${formatHexStringInput(inp)}`;
  //   });

  const inp = trimPrefix(input, '0x')
  const formatted = `${formatIntInput(
    Math.ceil(inp.length / 2),
  )}${formatHexStringInput(inp)}`
  return formatted
}

export function filterEvents(eventDSAddrList: any[], eventDSEsigsList: any[], rawreceiptList: string | any[]): [Uint8Array, Uint32Array] {
  // RLP Decode and Filter
  const [filteredRawReceiptList, filteredEventList] = rlpDecodeAndEventFilter(
    rawreceiptList,
    eventDSAddrList.map(addr => fromHexString(addr)),
    eventDSEsigsList.map(esigList => esigList.map((esig: string) => fromHexString(esig))),
  )

  // Gen Offsets
  // eslint-disable-next-line prefer-const
  let [rawReceipts, _matchedEventOffsets] = genStreamAndMatchedEventOffsets(
    filteredRawReceiptList,
    filteredEventList,
  )

  // Log
  logReceiptAndEvents(
    rawreceiptList,
    _matchedEventOffsets as any,
    filteredEventList,
  )

  // may remove
  const matchedEventOffsets = Uint32Array.from(_matchedEventOffsets) as any

  return [rawReceipts, matchedEventOffsets]
}
