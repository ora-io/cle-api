import { BlockPrep, EthereumDataPrep } from '../ethereum/blockprep'

export class UnsafeEthereumDataPrep extends EthereumDataPrep {
  blockPrepMap: Map<number, UnsafeBlockPrep>
  constructor(blockPrepMap: Map<any, any>, blocknumberOrder: number[], contextBlocknumber: number, expectedStateStr: string, latestBlocknumber: number) {
    super(new Map(), blocknumberOrder, contextBlocknumber, expectedStateStr, latestBlocknumber)
    this.blockPrepMap = blockPrepMap
  }
}

// name with *Prep to avoid confusion with cle-lib/Block
export class UnsafeBlockPrep extends BlockPrep {
  eventOffsets: Uint32Array
  constructor(rawblock: Record<string, string>) {
    super(rawblock)
    this.eventOffsets = new Uint32Array()
  }

  setEventOffsets(eventOffsets: Uint32Array) {
    this.eventOffsets = eventOffsets
  }

  getEventOffsets() {
    return this.eventOffsets
  }
}
