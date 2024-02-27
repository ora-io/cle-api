// import type { Decoded } from './rlp'
import { logger } from './logger'
import { areEqualArrays, toHexString } from './utils'
export class Event {
  address: Uint8Array
  topics: Uint8Array[]
  data: Uint8Array
  address_offset: number[]
  topics_offset: number[]
  data_offset: number[]
  constructor(
    address: Uint8Array,
    topics: Uint8Array[],
    data: Uint8Array,
    address_offset: number[],
    topics_offset: any[],
    data_offset: number[],
  ) {
    this.address = address
    this.topics = topics
    this.data = data
    this.address_offset = address_offset
    this.topics_offset = topics_offset
    this.data_offset = data_offset
  }

  prettyPrint(prefix = '', withoffsets = true) {
    logger.log(
      prefix,
      '|--addr :',
      toHexString(this.address),
      withoffsets ? this.address_offset : '',
    )
    for (let j = 0; j < this.topics.length; j++) {
      logger.log(
        prefix,
        `|--arg#${j.toString()}: ${toHexString(this.topics[j])}`,
        withoffsets ? this.topics_offset[j] : '',
      )
    }
    logger.log(
      prefix,
      '|--data :',
      toHexString(this.data),
      withoffsets ? this.data_offset : '',
    )
    logger.log('')
  }

  match(wantedAddressList: string | any[], wantedEsigsList: string | any[]) {
    if (wantedAddressList.length !== wantedEsigsList.length)
      throw new Error('[-] source address list length != source event signature list length.')

    for (let i = 0; i < wantedAddressList.length; i++) {
      if (areEqualArrays(this.address, wantedAddressList[i])) {
        const esig = this.topics[0]
        const wantedEsigs = wantedEsigsList[i]
        for (let j = 0; j < wantedEsigs.length; j++) {
          if (areEqualArrays(esig, wantedEsigs[j]))
            return true
        }
      }
    }
    return false
  }

  match_one(wantedAddress: Uint8Array, wantedEsigs: string | any[]) {
    if (areEqualArrays(this.address, wantedAddress)) {
      const esig = this.topics[0]
      for (let j = 0; j < wantedEsigs.length; j++) {
        if (areEqualArrays(esig, wantedEsigs[j])) {
          // TODO: what this variable is used for?
          // rst.push(this)
          break
        }
      }
    }
  }

  // TODO: must be match types and handle edge cases
  static fromRlp(rlpdata: any) {
    const address = rlpdata[0].data
    const address_offset = rlpdata[0].dataIndexes

    const topics = []
    const topics_offset = []
    for (let i = 0; i < rlpdata[1].data.length; i++) {
      topics.push(rlpdata[1].data[i].data)
      topics_offset.push(rlpdata[1].data[i].dataIndexes)
    }

    const data = rlpdata[2].data
    const data_offset = rlpdata[2].dataIndexes

    return new Event(
      address,
      topics,
      data,
      address_offset,
      topics_offset,
      data_offset,
    )
  }
}
