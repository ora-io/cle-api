
export class SlotPrep {
  constructor(
      key,
      value,
      storageProof
  ) {
      this.key = key;
      this.value = value;
      this.storageProof = storageProof;
  }
}

export class AccountPrep {
  constructor(
      address,
      rlpNode,
      accountProof
  ) {
      this.address = address;
      this.rlpNode = rlpNode;
      this.accountProof = accountProof;
      this.slots = new Map(); //<key: string, Slot>
  }

  addSlot(key, value, storageProof/** string[] */){
    this.slots.set(
      key,
      new SlotPrep(key, value, storageProof)
    )
  }

  getSlot(key) {
    if ( ! this.hashSlot(key)){
      throw new Error(`Lack data in blockPrep: slot (${key})`)
    }
      return this.slots.get(key);
  }

  hashSlot(key) {
    return this.slots.has(key);
  }

  addFromStorageProofList(storageProofList) {
    storageProofList.forEach(sp => {
      this.addSlot(sp.key, sp.value, sp.proof)
    });
  }
}

// name with *Prep to avoid confusion with zkgraph-lib/Block
export class BlockPrep {
  constructor(blocknum, rlpHeader) {
    this.number = blocknum;
    this.rlpHeader = rlpHeader;
    this.accounts = new Map(); //<string, Account>
    this.rlpreceipts = [];
  }

  addAccount(address, rlpAccount, accountProof) {
    this.accounts.set(
      address, 
      new AccountPrep(address, rlpAccount, accountProof)
    )
  }

  getAccount(address) {
    if ( ! this.hasAccount(address)){
      throw new Error(`Lack data in blockPrep: account (${address})`)
    }
    return this.accounts.get(address)
  }

  hasAccount(address) {
    return this.accounts.has(address)
  }

  addFromGetProofResult(ethproof, accountRLP=null) {
    let accountAddress = ethproof.address

    // add Account if not exist.
    if ( ! this.accounts.has(accountAddress)) {
      if (accountRLP == null){
        throw new Error("lack of accountRLP when new Account");
      }
      this.addAccount(accountAddress, accountRLP, ethproof.accountProof)
    }

    this.getAccount(accountAddress).addFromStorageProofList(ethproof.storageProof)
  }

  addRLPReceipts(rlpReceiptList) {
    rlpReceiptList.forEach(rlpRcpt => {
      this.rlpreceipts.push(rlpRcpt)
    });
  }

  getRLPReceipts() {
    return this.rlpreceipts;
  }
}