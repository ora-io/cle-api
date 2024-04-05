import { Trie } from '@ethereumjs/trie'
import { MapDB } from '@ethereumjs/util'

import { utils } from 'ethers'
import { Input } from 'zkwasm-toolchain'
import type { CLEYaml } from '../../types'
import { u32ListToUint8Array } from '../../common/utils'
import { fromHexString, uint8ArrayToHex } from '../../common/utils'
import type { BlockPrep, EthereumDataPrep } from './blockprep'
import { MptInput, ReceiptMptInput } from './mpt_input'

export function genAuxParams(
  cleYaml: CLEYaml,
  dataPrep: EthereumDataPrep,
) {
  let mptInput = new Input()
  mptInput = fillMPTInput(mptInput, cleYaml, dataPrep)

  const auxParams = {
    mpt: {
      private_input: mptInput.getPrivateInputStr(),
      public_input: mptInput.getPublicInputStr(),
      context_input: mptInput.getContextInputStr(),
    },
    adaptor: genAdaptorParams(cleYaml, dataPrep),
    extra: genExtra(cleYaml, dataPrep),
  }
  return auxParams
}

function fillMPTInput(input: Input, _cleYaml: CLEYaml, dataPrep: EthereumDataPrep) {
  // account and storage slot
  const mptIpt = new MptInput(dataPrep.blocknumberOrder.length)
  for (const blockNum of dataPrep.blocknumberOrder) {
    // console.log("block number:", blockNum)
    const blcokPrepData = dataPrep.blockPrepMap.get(blockNum)
    mptIpt.addBlock(blcokPrepData)
    // console.log("blcokPrepData:", blcokPrepData)
    // console.log("blcokPrepData.accounts:", blcokPrepData.accounts)

    console.log('ctx:', mptIpt.getCtx())
    console.log('private input:', mptIpt.getPriIpt())
  }
  input.append(mptIpt.getCtx(), 2)
  input.append(mptIpt.getPriIpt(), 0);

  // receipts
  (async () => {
    for (const blockNum of dataPrep.blocknumberOrder) {
      const trie = await Trie.create({ db: new MapDB() })
      const keys = []
      const keyHashs = []
      const values = []
      console.log('block number:', blockNum)
      const blcokPrepData = dataPrep.blockPrepMap.get(blockNum)
      const receiptCount = blcokPrepData.rlpreceipts.length
      for (let txIndex = 0; txIndex < receiptCount; txIndex++) {
        const key = toHexString(txIndex)
        const keyHash = utils.keccak256(fromHexString(key))
        const rlp = blcokPrepData.rlpreceipts[txIndex]
        console.log('key: ', key)
        console.log('key hash: ', keyHash)
        keys.push(key)
        keyHashs.push(keyHash)
        const rlpHash = utils.keccak256(fromHexString(rlp))
        values.push(rlpHash)
        console.log('rlp: ', rlp)
        console.log('rlpHash: ', rlpHash)
        await trie.put(fromHexString(keyHash), fromHexString(rlpHash))
      }

      const receiptRoot = uint8ArrayToHex(trie.root())
      console.log('receipt mpt root:', receiptRoot)

      const receiptMptIpt = new ReceiptMptInput(receiptCount, receiptRoot)
      for (let i = 0; i < keys.length; i++) {
        console.log('key: ', keys[i])
        console.log('key hash: ', keyHashs[i])
        console.log('value: ', values[i])
        const proof_paths = await getProof(keyHashs[i], trie)
        receiptMptIpt.addReceipt(keys[i], keyHashs[i], values[i], proof_paths)
      }
      console.log('ctx:', receiptMptIpt.getCtx())
      console.log('private input:', receiptMptIpt.getPriIpt())
    }
  })()

  return input
}

function genAdaptorParams(_cleYaml: CLEYaml, dataPrep: EthereumDataPrep) {
  const adaptorParam = {
    checkpoint_blocknum: calcCheckpointBlocknum([4321]), // "0x1234"
    mpt_blocknums: dataPrep.blocknumberOrder, // ["blocknum1", "blocknum2", ...]
    mpt_stateroots: dataPrep.blocknumberOrder.map((bn: any) => { return (dataPrep.blockPrepMap.get(bn) as BlockPrep).stateRoot }), // ["0xstateroot1", "0xstateroot2", ...]
    // placeholder
    mpt_receiptroots: dataPrep.blocknumberOrder.map((bn: any) => { return (dataPrep.blockPrepMap.get(bn) as BlockPrep).receiptsRoot }),
    mpt_txroots: dataPrep.blocknumberOrder.map((bn: any) => { return (dataPrep.blockPrepMap.get(bn) as BlockPrep).transactionsRoot }),
    rlp_blockheader: dataPrep.blocknumberOrder.map(
      (bn: any) => { return isRecentBlock(bn, dataPrep.latestBlocknumber) ? (dataPrep.blockPrepMap.get(bn) as BlockPrep).rlpheader : null }), // ['0xrecentblockheaderrlp', '' for bho blocknum]
  }
  return adaptorParam
}

function isRecentBlock(blocknum: number, latestBlocknumber: number) {
  return blocknum > latestBlocknumber - 200 // TODO: fine-tune this.
}

function calcCheckpointBlocknum(_blockNums: number[]) {
  // TODO: enable later
  return null
}

// Used in trigger / verify only
function genExtra(_cleYaml: CLEYaml, dataPrep: EthereumDataPrep): Uint8Array {
  // TODO: double check here
  const encode = (dict: { [key: string]: any }): Uint8Array => {
    const u8a = u32ListToUint8Array(dict.rct_blocknum, 32, true)
    return u8a
  }
  const verifyExtra = {
    rct_blocknum: dataPrep.blocknumberOrder.map(
      (bn: any) => { return isRecentBlock(bn, dataPrep.latestBlocknumber) ? (dataPrep.blockPrepMap.get(bn) as BlockPrep).number : null }), // ['0xrecentblockheaderrlp', '' for bho blocknum]
  }
  return encode(verifyExtra)
}

async function getProof(key: string, trie: Trie): Promise<string[]> {
  const { stack } = await trie.findPath(fromHexString(key))
  const proof_paths = []
  for (let i = 0; i < stack.length; i++)
    proof_paths.push(uint8ArrayToHex(stack[i].serialize()))

  console.log('proof paths: ', proof_paths)
  return proof_paths
}

function toHexString(num: number): string {
  const hexString = num.toString(16)
  const paddingSize = 64 - hexString.length
  const padding = '0'.repeat(paddingSize)
  return padding + hexString
}
