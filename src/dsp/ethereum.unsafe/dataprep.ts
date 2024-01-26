import type { BytesLike } from 'ethers'
import type { Hexable } from 'ethers/lib/utils'
import { BlockPrep, EthereumDataPrep } from '../ethereum/blockprep'

export class UnsafeEthereumDataPrep extends EthereumDataPrep {
  blockPrepMap: Map<number, UnsafeBlockPrep>
  constructor(blockPrepMap: Map<any, any>, blocknumberOrder: number[], latestBlockhash: string, expectedStateStr: string) {
    super(new Map(), blocknumberOrder, latestBlockhash, expectedStateStr)
    this.blockPrepMap = blockPrepMap
  }
}

// name with *Prep to avoid confusion with cle-lib/Block
export class UnsafeBlockPrep extends BlockPrep {
  eventOffsets: Uint32Array
  constructor(blocknum: number | bigint | BytesLike | Hexable, rlpHeader: string) {
    super(blocknum, rlpHeader)
    this.eventOffsets = new Uint32Array()
  }

  setEventOffsets(eventOffsets: Uint32Array) {
    this.eventOffsets = eventOffsets
  }

  getEventOffsets() {
    return this.eventOffsets
  }
}
