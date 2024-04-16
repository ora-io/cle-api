import { safeHex } from '../../common/utils'
import type { BlockPrep } from './blockprep'

function i32ToLittleEndian(value: number) {
  /**
   * Converts i32 number to little endian hex string.
   */
  const buffer = Buffer.alloc(8)
  buffer.writeUInt32LE(value, 0)
  return buffer.toString('hex')
}

function prependLengthInLittleEndianHex(hexString: string) {
  const lengthInBytes = hexString.length / 2
  const lengthAsLittleEndianHex = i32ToLittleEndian(lengthInBytes)
  return lengthAsLittleEndianHex + hexString
}

function formatProofPath(rawProofPath: string) {
  let proofPath = ''
  if (rawProofPath.startsWith('0x'))
    proofPath = rawProofPath.slice(2)
  else
    proofPath = rawProofPath

  const newHexString = prependLengthInLittleEndianHex(proofPath)
  return newHexString
}

function pad2LittleEndian(rawHex: string) {
  /**
   * Pads the given hex string to 8 bytes (u64) divisible and convert to little endian.
   */
  const length = rawHex.length
  const remainder = length % 16
  if (remainder === 0)
    return rawHex

  const paddingSize = 16 - remainder
  const paddedHexString = toLittleEndian(rawHex) + '0'.repeat(paddingSize)
  return paddedHexString
}

function padHexString(rawHex: string) {
  /**
   * Pads the given hex string to 8 bytes (u64) divisible.
   */
  const length = rawHex.length
  const remainder = length % 16
  if (remainder === 0)
    return rawHex

  const paddingSize = 16 - remainder
  const paddedHexString = rawHex + '0'.repeat(paddingSize)
  return paddedHexString
}

function toLittleEndian(hexString: string) {
  const result = hexString.match(/../g)
  if (result)
    return result.reverse().join('')

  return ''
}

export class MptInput {
  blockCnt: number
  priIpt: string
  ctx: string
  constructor(blockCnt: number) {
    this.blockCnt = blockCnt
    this.priIpt = ''
    // block count
    this.ctx = `0x${pad2LittleEndian(safeHex(this.blockCnt.toString()))}`
  }

  addBlock(blockPrep: BlockPrep) {
    this.ctx += this.addBlock2Ctx(blockPrep)
    this.priIpt += this.addBlock2PriIpt(blockPrep)
  }

  addBlock2Ctx(blockPrep: BlockPrep) {
    let currCtx = ''
    // block number
    currCtx += padHexString(toLittleEndian(safeHex(blockPrep.number.toString(16))))
    // account count
    const accCnt = blockPrep.accounts.size
    currCtx += pad2LittleEndian(safeHex(accCnt.toString(16)))
    for (const [addr, accData] of blockPrep.accounts) {
      // address
      currCtx += padHexString(safeHex(addr))
      // account rlp
      currCtx += pad2LittleEndian(safeHex((safeHex(accData.rlpNode).length / 2).toString(16)))
      currCtx += padHexString(safeHex(accData.rlpNode))
      // slot count
      const slotCnt = accData.slots.size
      currCtx += pad2LittleEndian(safeHex(slotCnt.toString(16)))
      for (const [slotKey, slotData] of accData.slots) {
        currCtx += padHexString(safeHex(slotKey))
        currCtx += pad2LittleEndian(safeHex((safeHex(slotData.value).length / 2).toString(16)))
        currCtx += padHexString(safeHex(slotData.value))
      }
    }
    return currCtx
  }

  addBlock2PriIpt(blockPrep: BlockPrep) {
    let currPriIpt = ''
    // state root
    currPriIpt += `0x${safeHex(blockPrep.stateRoot)}:bytes-packed `
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, accData] of blockPrep.accounts) {
      // account proof count
      currPriIpt += `0x${safeHex(accData.accountProof.length.toString(16))}:i64 `
      let proofStream = ''
      for (const proof of accData.accountProof)
        proofStream += formatProofPath(safeHex(proof))

      // proof steam length
      currPriIpt += `0x${safeHex((proofStream.length / 2).toString(16))}:i64 `
      // proof steam
      currPriIpt += `0x${proofStream}:bytes-packed `
      // storage hash root
      currPriIpt += `${accData.storageHash}:bytes-packed `
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_, slotData] of accData.slots) {
        // proof count
        currPriIpt += `0x${safeHex(slotData.storageProof.length.toString(16))}:i64 `
        let slotPrfStream = ''
        for (const proof of slotData.storageProof)
          slotPrfStream += formatProofPath(safeHex(proof))

        // slot proof stream length
        currPriIpt += `0x${safeHex((slotPrfStream.length / 2).toString(16))}:i64 `
        // slot proof steam
        currPriIpt += `0x${slotPrfStream}:bytes-packed `
      }
    }
    return currPriIpt
  }

  getCtx() {
    return `${this.ctx}:bytes-packed`
  }

  getPriIpt() {
    return this.priIpt
  }
}

module.exports = MptInput

export class ReceiptMptInput {
  receiptCnt: number
  receiptRoot: string
  priIpt: string
  ctx: string
  constructor(receiptCnt: number, receiptRoot: string) {
    this.receiptCnt = receiptCnt
    this.receiptRoot = receiptRoot
    this.priIpt = `0x${safeHex(receiptRoot)}:bytes-packed `
    // receipt count
    this.ctx = `0x${pad2LittleEndian(safeHex(this.receiptCnt.toString()))}`
  }

  addReceipt(key: string, value: string, valueHash: string, proofPath: string[]) {
    this.ctx += this.addReceipt2Ctx(key, safeHex(valueHash))
    this.priIpt += this.addReceipt2PriIpt(key, safeHex(value), proofPath)
  }

  addReceipt2Ctx(key: string, valueHash: string) {
    // receipt index/ key
    let currCtx = pad2LittleEndian(safeHex((safeHex(key).length / 2).toString(16)))
    currCtx += padHexString(safeHex(key))
    // receipt value
    currCtx += padHexString(safeHex(valueHash))
    return currCtx
  }

  addReceipt2PriIpt(key: string, value: string, proofPath: string[]) {
    // value rlp length
    let currPriIpt = `0x${safeHex((value.length / 2).toString(16))}:i64 `
    // value
    currPriIpt += `0x${value}:bytes-packed `
    // proof count
    currPriIpt += `0x${safeHex(proofPath.length.toString(16))}:i64 `
    let slotPrfStream = ''
    for (const proof of proofPath)
      slotPrfStream += formatProofPath(safeHex(proof))

    // slot proof stream length
    currPriIpt += `0x${safeHex((slotPrfStream.length / 2).toString(16))}:i64 `
    // slot proof steam
    currPriIpt += `0x${slotPrfStream}:bytes-packed `
    // slot proof hash steam
    return currPriIpt
  }

  getCtx() {
    return `${this.ctx}:bytes-packed`
  }

  getPriIpt() {
    return this.priIpt
  }
}

module.exports = ReceiptMptInput
