import type { EthereumDataPrep } from '../ethereum/blockprep.js'
import type { UnsafeEthereumDataPrep } from '../ethereum.unsafe/dataprep.js'
import { DataPrep } from '../interface.js'

// includes both exec & prove params
export class ETHUnsafe_ETH_DataPrep extends DataPrep {
  unsafeETHDP: UnsafeEthereumDataPrep
  safeEthDP: EthereumDataPrep
  // latestBlockhash & expectedStateStr should use these, not the ones in 2 xxxDataPreps
  latestBlockhash: string
  constructor(ethUnsafeDP: UnsafeEthereumDataPrep, ethDP: EthereumDataPrep, latestBlockhash: string, expectedStateStr: string) {
    super(expectedStateStr)
    this.unsafeETHDP = ethUnsafeDP
    this.safeEthDP = ethDP
    this.latestBlockhash = latestBlockhash

    // unify to avoid ambiguity
    this.unsafeETHDP.latestBlockhash = latestBlockhash
    this.unsafeETHDP.expectedStateStr = expectedStateStr
    this.safeEthDP.latestBlockhash = latestBlockhash
    this.safeEthDP.expectedStateStr = expectedStateStr
  }
}
