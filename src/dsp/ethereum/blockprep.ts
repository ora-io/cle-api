import type { providers } from 'ethers'
import { RLP } from '@ethereumjs/rlp'
import { DataPrep } from '../interface'
import { safeHex, uint8ArrayToHex } from '../../common/utils'
import { MPTTrie } from './trie'

// includes both exec & prove params
export class EthereumDataPrep extends DataPrep {
  blockPrepMap: Map<number, any>
  blocknumberOrder: number[]
  contextBlocknumber: number // the blocknum given by user when exec a cle
  latestBlocknumber: number // the latest blocknum when proving
  constructor(blockPrepMap: Map<any, any>, blocknumberOrder: number[], contextBlocknumber: number, expectedStateStr: string, latestBlocknumber: number) {
    super(expectedStateStr)
    this.blockPrepMap = blockPrepMap
    this.blocknumberOrder = blocknumberOrder
    this.contextBlocknumber = contextBlocknumber
    this.latestBlocknumber = latestBlocknumber
  }
}

export class SlotPrep {
  key: any
  value: any
  storageProof: any
  constructor(
    key: any,
    value: any,
    storageProof: any,
  ) {
    this.key = key
    this.value = value
    this.storageProof = storageProof
  }
}

export class AccountPrep {
  address: any
  rlpNode: any
  storageHash: any
  accountProof: any
  slots: Map<string, SlotPrep>
  constructor(
    address: any,
    rlpNode: any,
    storageHash: any,
    accountProof: any,
  ) {
    this.address = address
    this.rlpNode = rlpNode
    this.storageHash = storageHash
    this.accountProof = accountProof
    this.slots = new Map() // <key: string, Slot>
  }

  addSlot(key: any, value: any, storageProof: any/** string[] */) {
    this.slots.set(
      key,
      new SlotPrep(key, value, storageProof),
    )
  }

  getSlot(key: any) {
    if (!this.hashSlot(key))
      throw new Error(`Lack data in blockPrep: slot (${key})`)

    return this.slots.get(key)
  }

  hashSlot(key: any) {
    return this.slots.has(key)
  }

  addFromStorageProofList(storageProofList: any[]) {
    storageProofList.forEach((sp: { key: any; value: any; proof: any }) => {
      this.addSlot(sp.key, sp.value, sp.proof)
    })
  }
}

// name with *Prep to avoid confusion with cle-lib/Block
export class BlockPrep {
  rlpheader: string
  number: any
  timestamp: any
  // rlpHeader: any
  hash: string
  stateRoot: string
  receiptsRoot: string
  transactionsRoot: string
  accounts: Map<string, AccountPrep>
  rlpreceipts: string[]
  transactions: providers.TransactionResponse[]
  // tries
  receiptTrie: MPTTrie
  // constructor(blocknum: number | bigint | BytesLike | Hexable, hash: string, stateRoot: string, receiptsRoot: string, transactionsRoot: string) {
  constructor(rawblock: Record<string, string>) {
    // console.log('rawblock:', rawblock)
    this.number = parseInt(rawblock.number, 16)
    this.timestamp = parseInt(rawblock.timestamp, 16)
    this.hash = rawblock.hash
    this.stateRoot = rawblock.stateRoot
    this.receiptsRoot = rawblock.receiptsRoot
    this.transactionsRoot = rawblock.transactionsRoot
    this.rlpheader = this.calcHeaderRLP(rawblock)
    this.accounts = new Map() // <string, Account>
    this.rlpreceipts = []
    this.transactions = []
    this.receiptTrie = new MPTTrie()
  }

  calcHeaderRLP(rawblock: Record<string, string>): string {
    const nestedList = this.formatBlockHeaderForRLP(rawblock)
    const blockheaderRLP = uint8ArrayToHex(RLP.encode(nestedList))
    return blockheaderRLP
  }

  formatBlockHeaderForRLP(rawblock: Record<string, string>): Buffer[] {
    const nestedList = [
      Buffer.from(safeHex(rawblock.parentHash), 'hex'),
      Buffer.from(safeHex(rawblock.sha3Uncles), 'hex'),
      Buffer.from(safeHex(rawblock.miner), 'hex'),
      Buffer.from(safeHex(rawblock.stateRoot), 'hex'),
      Buffer.from(safeHex(rawblock.transactionsRoot), 'hex'),
      Buffer.from(safeHex(rawblock.receiptsRoot), 'hex'),
      Buffer.from(safeHex(rawblock.logsBloom), 'hex'),
      Buffer.from(safeHex(rawblock.difficulty), 'hex'),
      Buffer.from(safeHex(rawblock.number), 'hex'),
      Buffer.from(safeHex(rawblock.gasLimit), 'hex'),
      Buffer.from(safeHex(rawblock.gasUsed), 'hex'),
      Buffer.from(safeHex(rawblock.timestamp), 'hex'),
      Buffer.from(safeHex(rawblock.extraData), 'hex'),
      Buffer.from(safeHex(rawblock.mixHash), 'hex'),
      Buffer.from(safeHex(rawblock.nonce), 'hex'),
      Buffer.from(safeHex(rawblock.baseFeePerGas), 'hex'),
      Buffer.from(safeHex(rawblock.withdrawalsRoot), 'hex'),
    ]
    return nestedList
  }

  setAccount(address: string, rlpAccount: string, storageHash: string, accountProof: any) {
    this.accounts.set(
      address.toLowerCase(),
      new AccountPrep(address, rlpAccount, storageHash, accountProof),
    )
  }

  getAccount(address: string): AccountPrep {
    const acctPrep = this.accounts.get(address.toLowerCase())
    if (!acctPrep)
      throw new Error(`Lack data in blockPrep: account (${address})`)
    return acctPrep
  }

  hasAccount(address: string) {
    return this.accounts.has(address.toLowerCase())
  }

  addFromGetProofResult(ethproof: { address: any; accountProof: any; storageHash: any; storageProof: any }, accountRLP: string | null = null) {
    const accountAddress = ethproof.address

    // add Account if not exist.
    if (!this.accounts.has(accountAddress)) {
      if (accountRLP == null)
        throw new Error('lack of accountRLP when new Account')

      this.setAccount(accountAddress, accountRLP, ethproof.storageHash, ethproof.accountProof)
    }

    this.getAccount(accountAddress)?.addFromStorageProofList(ethproof.storageProof)
  }

  setReceiptRLPs(rlpReceiptList: string[]) {
    this.rlpreceipts = []
    // deep copy
    rlpReceiptList.forEach((rlpRcpt: string) => {
      this.rlpreceipts.push(rlpRcpt)
    })
  }

  getReceiptRLPs(): string[] {
    return this.rlpreceipts
  }

  setReceiptTrie(trie: MPTTrie) {
    this.receiptTrie = trie
  }

  setTransactions(transactions: providers.TransactionResponse[]): void {
    this.transactions = transactions
  }
}
