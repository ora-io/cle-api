import type { providers } from 'ethers'
import { ethers } from 'ethers'
import { RLP } from '@ethereumjs/rlp'
import { safeHex, uint8ArrayToHex } from '../../common/utils'
import type { CLEYaml } from '../../types/zkgyaml'
import type { EthereumDataSource } from '../../types/zkgyaml_eth'
import { dspHooks } from '../hooks'
import { BlockPrep, EthereumDataPrep } from './blockprep'

export async function prepareBlocksByYaml(provider: providers.JsonRpcProvider, latestBlocknumber: number, _latestBlockhash: string, expectedStateStr: string, cleYaml: CLEYaml) {
  // TODO: multi blocks
  const blockPrep = await prepareOneBlockByYaml(provider, latestBlocknumber, cleYaml)

  const blockPrepMap = new Map()
  blockPrepMap.set(latestBlocknumber, blockPrep)

  const blocknumOrder = [latestBlocknumber]

  return new EthereumDataPrep(blockPrepMap, blocknumOrder, latestBlocknumber, expectedStateStr)
}

// modularize prepareOneBlockFunc, re-use in eth local dsp.
let prepareOneBlockFunc = prepareOneBlock
export function setPrePareOneBlockFunc(_func: any) {
  prepareOneBlockFunc = _func
}

export async function prepareOneBlockByYaml(provider: providers.JsonRpcProvider, blockNumber: any, cleYaml: CLEYaml) {
  let stateDSAddrList, stateDSSlotsList
  const ds = cleYaml.getFilteredSourcesByKind('ethereum')[0] as unknown as EthereumDataSource
  if (ds.storage)
    [stateDSAddrList, stateDSSlotsList] = ds.getStorageLists()

  else
    [stateDSAddrList, stateDSSlotsList] = [[], []]

  const needRLPReceiptList = ds.event != null
  const needTransactions = ds.transaction != null

  return await prepareOneBlockFunc(provider, blockNumber, stateDSAddrList, stateDSSlotsList, needRLPReceiptList, needTransactions)
}

export async function prepareOneBlock(provider: providers.JsonRpcProvider, blockNumber: number, stateDSAddrList: any[], stateDSSlotsList: any[][], needRLPReceiptList: boolean, needTransactions: boolean) {
  // let [stateDSAddrList, stateDSSlotsList] = [stateDSAddrList, stateDSSlotsList]
  const rawblock = await dspHooks.getBlock(provider, blockNumber)
  const block = new BlockPrep(
    blockNumber,
    rawblock.hash,
    rawblock.stateRoot,
    rawblock.receiptsRoot,
    rawblock.transactionsRoot,
  )

  /**
   * prepare storage data
   */

  for (let i = 0; i < stateDSAddrList.length; i++) {
    // request
    const ethproof = await dspHooks.getProof(
      provider,
      stateDSAddrList[i],
      stateDSSlotsList[i],
      ethers.utils.hexValue(blockNumber),
    )

    if (ethproof.balance === '0x0')
      ethproof.balance = ''

    if (ethproof.nonce === '0x0')
      ethproof.nonce = ''

    const nestedList = [
      Buffer.from(safeHex(ethproof.nonce), 'hex'),
      Buffer.from(safeHex(ethproof.balance), 'hex'),
      Buffer.from(safeHex(ethproof.storageHash), 'hex'),
      Buffer.from(safeHex(ethproof.codeHash), 'hex'),
    ]

    const accountRLP = uint8ArrayToHex(RLP.encode(nestedList))

    block.addFromGetProofResult(ethproof, accountRLP)
  }

  /**
   * prepare raw receipts data
   */
  if (needRLPReceiptList) {
    const rawreceiptList = await dspHooks.getRawReceipts(provider, blockNumber).catch(
      (error) => {
        throw error
      },
    )

    block.addRLPReceipts(rawreceiptList)
  }

  // TODO: improve this, reduce getBlock times
  if (needTransactions) {
    const blockwithtxs = await dspHooks.getBlockWithTxs(provider, blockNumber)
    block.setTransactions(blockwithtxs.transactions)
  }

  return block
}
