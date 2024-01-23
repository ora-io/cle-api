import type { EthereumDataPrep } from '../ethereum/blockprep.js'
import type { EthereumUnsafeDataPrep } from '../ethereum.unsafe/dataprep.js'
import { DataPrep } from '../interface.js'

// includes both exec & prove params
export class ETHUnsafe_ETH_DataPrep extends DataPrep {
  ethUnsafeDP: EthereumUnsafeDataPrep
  ethDP: EthereumDataPrep
  // latestBlockhash & expectedStateStr should use these, not the ones in 2 xxxDataPreps
  latestBlockhash: string
  expectedStateStr: string
  constructor(ethUnsafeDP: EthereumUnsafeDataPrep, ethDP: EthereumDataPrep, latestBlockhash: string, expectedStateStr: string) {
    super()
    this.ethUnsafeDP = ethUnsafeDP
    this.ethDP = ethDP
    this.latestBlockhash = latestBlockhash
    this.expectedStateStr = expectedStateStr

    // unify to avoid ambiguity
    this.ethUnsafeDP.latestBlockhash = latestBlockhash
    this.ethUnsafeDP.expectedStateStr = expectedStateStr
    this.ethDP.latestBlockhash = latestBlockhash
    this.ethDP.expectedStateStr = expectedStateStr
  }
}
