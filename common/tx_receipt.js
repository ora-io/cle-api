import { fromHexString } from "./utils.js";
import { Event } from "./event.js";

import { RLP } from '@ethereumjs/rlp'

export class TxReceipt {
  constructor(status, gasUsed, logsBloom, events) {
    this.status = status;
    this.gasUsed = gasUsed;
    this.logsBloom = logsBloom;
    this.events = events;
  }

  static fromRawBin(rawReceipt) {
    /** EIP-2718 */
    if (rawReceipt[0] <= 2) {
      const txtype = rawReceipt[0]; // useless
      rawReceipt = rawReceipt.slice(1);
    }
    const rlpdata = RLP.decode(rawReceipt);
    const status = rlpdata[0].data;
    const gasUsed = rlpdata[1].data;
    const logsBloom = rlpdata[2].data;

    const rlpevents = rlpdata[3].data;
    const events = [];
    for (let i = 0; i < rlpevents.length; i++) {
      events.push(Event.fromRlp(rlpevents[i].data));
    }
    return new TxReceipt(status, gasUsed, logsBloom, events);
  }

  static fromRawStr(rawReceiptStr) {
    return TxReceipt.fromRawBin(fromHexString(rawReceiptStr));
  }

  toValidEvents() {
    if (this.status != 0x1) {
      // tx failed
      return [];
    } else {
      return this.events;
    }
  }

  filter(wantedAddressList, wantedEsigsList) {
    const events = this.toValidEvents();
    const rst = [];
    for (let i = 0; i < events.length; i++) {
      if (events[i].match(wantedAddressList, wantedEsigsList)){
        rst.push(events[i]);
        // TODO: double check: what if there's more than 1 events matched?
        // break;
      }
    }
    return rst;
  }
}
