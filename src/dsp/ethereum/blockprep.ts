import type { BytesLike, providers } from 'ethers'
import type { Hexable } from 'ethers/lib/utils'
import { DataPrep } from '../interface.js'

// includes both exec & prove params
export class EthereumDataPrep extends DataPrep {
  blockPrepMap: any
  blocknumberOrder: any
  latestBlockhash: any
  expectedStateStr: any
  constructor(blockPrepMap: Map<any, any>, blocknumberOrder: number[], latestBlockhash: string, expectedStateStr: string) {
    super()
    this.blockPrepMap = blockPrepMap
    this.blocknumberOrder = blocknumberOrder
    this.latestBlockhash = latestBlockhash
    this.expectedStateStr = expectedStateStr
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
  accountProof: any
  slots: Map<any, any>
  constructor(
    address: any,
    rlpNode: any,
    accountProof: any,
  ) {
    this.address = address
    this.rlpNode = rlpNode
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

// name with *Prep to avoid confusion with zkgraph-lib/Block
export class BlockPrep {
  number: any
  rlpHeader: any
  accounts: Map<string, AccountPrep>
  rlpreceipts: any[]
  transactions: providers.TransactionResponse[]
  constructor(blocknum: number | bigint | BytesLike | Hexable, rlpHeader: string) {
    this.number = blocknum
    this.rlpHeader = rlpHeader
    this.accounts = new Map() // <string, Account>
    this.rlpreceipts = []
    this.transactions = []
  }

  addAccount(address: string, rlpAccount: string, accountProof: any) {
    this.accounts.set(
      address,
      new AccountPrep(address, rlpAccount, accountProof),
    )
  }

  getAccount(address: string) {
    if (!this.hasAccount(address))
      throw new Error(`Lack data in blockPrep: account (${address})`)

    return this.accounts.get(address)
  }

  hasAccount(address: string) {
    return this.accounts.has(address)
  }

  addFromGetProofResult(ethproof: { address: any; accountProof: any; storageProof: any }, accountRLP: string | null = null) {
    const accountAddress = ethproof.address

    // add Account if not exist.
    if (!this.accounts.has(accountAddress)) {
      if (accountRLP == null)
        throw new Error('lack of accountRLP when new Account')

      this.addAccount(accountAddress, accountRLP, ethproof.accountProof)
    }

    this.getAccount(accountAddress)?.addFromStorageProofList(ethproof.storageProof)
  }

  addRLPReceipts(rlpReceiptList: any[]) {
    rlpReceiptList.forEach((rlpRcpt: any) => {
      this.rlpreceipts.push(rlpRcpt)
    })
  }

  setTransactions(transactions: providers.TransactionResponse[]) {
    this.transactions = transactions
  }

  getRLPReceipts() {
    return this.rlpreceipts
  }
}
