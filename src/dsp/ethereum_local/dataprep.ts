import type { BytesLike } from 'ethers'
import type { Hexable } from 'ethers/lib/utils'
import { BlockPrep, EthereumDataPrep } from '../ethereum/blockprep'

// includes both exec & prove params
export class EthereumLocalDataPrep extends EthereumDataPrep {
  blockPrepMap: Map<number, BlockLocalPrep>
  constructor(blockPrepMap: Map<any, any>, blocknumberOrder: number[], latestBlocknumber: string, expectedStateStr: string) {
    super(new Map(), blocknumberOrder, latestBlocknumber, expectedStateStr)
    this.blockPrepMap = blockPrepMap
  }
}

// name with *Prep to avoid confusion with cle-lib/Block
export class BlockLocalPrep extends BlockPrep {
  eventOffsets: Uint32Array
  constructor(blocknum: number | bigint | BytesLike | Hexable, hash: string, stateRoot: string, receiptsRoot: string, transactionsRoot: string) {
    super(blocknum, hash, stateRoot, receiptsRoot, transactionsRoot)
    this.eventOffsets = new Uint32Array()
  }

  setEventOffsets(eventOffsets: Uint32Array) {
    this.eventOffsets = eventOffsets
  }

  getEventOffsets() {
    return this.eventOffsets
  }
}
