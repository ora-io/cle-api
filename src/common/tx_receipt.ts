import { fromHexString } from './utils'
import { Event } from './event'

import type { Decoded } from './rlp'
import RLP from './rlp'

export class TxReceipt {
  status: any
  gasUsed: any
  logsBloom: any
  events: any
  constructor(status: number, gasUsed: number, logsBloom: Uint8Array, events: Event[]) {
    this.status = status
    this.gasUsed = gasUsed
    this.logsBloom = logsBloom
    this.events = events
  }

  static fromRawBin(rawReceipt: Uint8Array) {
    /** EIP-2718 */
    if (rawReceipt[0] <= 2) {
      // const txtype = rawReceipt[0] // useless
      rawReceipt = rawReceipt.slice(1)
    }
    const rlpdata = RLP.decode(rawReceipt)
    const status = (rlpdata[0].data as Uint8Array)[0]
    const gasUsed = (rlpdata[1].data as Uint8Array)[0]
    const logsBloom = (rlpdata[2].data as Uint8Array)

    const rlpevents = rlpdata[3].data as Decoded[]
    const events = []
    for (let i = 0; i < rlpevents.length; i++)
      events.push(Event.fromRlp(rlpevents[i].data))

    return new TxReceipt(status, gasUsed, logsBloom, events)
  }

  static fromRawStr(rawReceiptStr: string) {
    return TxReceipt.fromRawBin(fromHexString(rawReceiptStr))
  }

  toValidEvents() {
    if (this.status !== 0x1) {
      // tx failed
      return []
    }
    else {
      return this.events
    }
  }

  filter(wantedAddressList: any, wantedEsigsList: any) {
    const events = this.toValidEvents()
    const rst = []
    for (let i = 0; i < events.length; i++) {
      if (events[i].match(wantedAddressList, wantedEsigsList))
        rst.push(events[i])
        // TODO: double check: what if there's more than 1 events matched?
        // break;
    }
    return rst
  }
}
