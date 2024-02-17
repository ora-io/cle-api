import { utils } from 'ethers'
import type { BlockPrep } from './blockprep'

function i32ToLittleEndianHexStr(value: number) {
  const buffer = Buffer.alloc(8)
  buffer.writeUInt32LE(value, 0)
  return buffer.toString('hex')
}

function prependLengthInLittleEndianHex(hexString: string) {
  const lengthInBytes = hexString.length / 2
  const lengthAsLittleEndianHex = i32ToLittleEndianHexStr(lengthInBytes)
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

function safeHex(rawHex: string) {
  let hex = ''
  if (rawHex.startsWith('0x'))
    hex = rawHex.slice(2)
  else
    hex = rawHex

  if (hex.length % 2 === 0)
    return hex
  else
    return `0${hex}`
}

function padHexStringToU64LengthLittleEndian(rawHex: string) {
  const length = rawHex.length
  const remainder = length % 16
  if (remainder === 0)
    return rawHex

  const paddingSize = 16 - remainder
  const paddedHexString = rawHex + '0'.repeat(paddingSize)
  return paddedHexString
}

function hexToLittleEndian(hexString: string) {
  const result = hexString.match(/../g)?.reverse().join('')
  return result
}

export class MptInput {
  blockCnt: number
  priIpt: string
  ctx: string
  constructor(blockCnt: number) {
    this.blockCnt = blockCnt
    this.priIpt = ''
    // block count
    this.ctx = `0x${padHexStringToU64LengthLittleEndian(safeHex(this.blockCnt.toString()))}`
  }

  addBlock(blockPrep: BlockPrep) {
    this.ctx += this.addBlock2Ctx(blockPrep)
    this.priIpt += this.addBlock2PriIpt(blockPrep)
  }

  addBlock2Ctx(blockPrep: BlockPrep) {
    let currCtx = ''
    // block number
    currCtx += padHexStringToU64LengthLittleEndian(hexToLittleEndian(safeHex(blockPrep.number.toString(16))))
    // account count
    const accCnt = blockPrep.accounts.size
    currCtx += padHexStringToU64LengthLittleEndian(safeHex(accCnt.toString(16)))
    for (const [addr, accData] of blockPrep.accounts) {
      // address
      currCtx += padHexStringToU64LengthLittleEndian(safeHex(addr))
      // account rlp
      currCtx += padHexStringToU64LengthLittleEndian(safeHex((safeHex(accData.rlpNode).length / 2).toString(16)))
      currCtx += padHexStringToU64LengthLittleEndian(safeHex(accData.rlpNode))
      // slot count
      const slotCnt = accData.slots.size
      currCtx += padHexStringToU64LengthLittleEndian(safeHex(slotCnt.toString(16)))
      for (const [slotKey, slotData] of accData.slots) {
        currCtx += padHexStringToU64LengthLittleEndian(safeHex(slotKey))
        currCtx += padHexStringToU64LengthLittleEndian(safeHex((safeHex(slotData.value).length / 2).toString(16)))
        currCtx += padHexStringToU64LengthLittleEndian(safeHex(slotData.value))
      }
    }
    return currCtx
  }

  addBlock2PriIpt(blockPrep: BlockPrep) {
    let currPriIpt = ''
    // state root
    currPriIpt += `0x${safeHex(blockPrep.stateRoot)}:bytes-packed `
    for (const [addr, accData] of blockPrep.accounts) {
      // address hash
      currPriIpt += `${utils.keccak256(addr)}:bytes-packed `
      // account proof count
      currPriIpt += `0x${safeHex(accData.accountProof.length.toString(16))}:i64 `
      let proofStream = ''; let proofHashStream = ''
      for (const proof of accData.accountProof) {
        proofStream += formatProofPath(safeHex(proof))
        proofHashStream += safeHex(utils.keccak256(proof))
      }
      // proof steam length
      currPriIpt += `0x${safeHex((proofStream.length / 2).toString(16))}:i64 `
      // proof steam
      currPriIpt += `0x${proofStream}:bytes-packed `
      // proof hash steam
      currPriIpt += `0x${proofHashStream}:bytes-packed `
      // storage hash
      currPriIpt += `0x${blockPrep.transactionsRoot}:bytes-packed `
      for (const [slotKey, slotData] of accData.slots) {
        // key hash
        currPriIpt += `${utils.keccak256(slotKey)}:bytes-packed `
        // proof count
        currPriIpt += `0x${safeHex(slotData.storageProof.length.toString(16))}:i64 `
        let slotPrfStream = ''; let slotPrfHashStream = ''
        for (const proof of slotData.storageProof) {
          slotPrfStream += formatProofPath(safeHex(proof))
          slotPrfHashStream += safeHex(utils.keccak256(proof))
        }
        // slot proof stream length
        currPriIpt += `0x${safeHex((slotPrfStream.length / 2).toString(16))}:i64 `
        // slot proof steam
        currPriIpt += `0x${slotPrfStream}:bytes-packed `
        // slot proof hash steam
        currPriIpt += `0x${slotPrfHashStream}:bytes-packed `
      }
    }
    return currPriIpt
  }

  getCtx() {
    return this.ctx
  }

  getPriIpt() {
    return this.priIpt
  }
}

export default MptInput
