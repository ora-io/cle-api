import type { EthereumDataPrep } from '../ethereum/blockprep'
import type { UnsafeEthereumDataPrep } from '../ethereum.unsafe/dataprep'
import { DataPrep } from '../interface'

// includes both exec & prove params
export class UnsafeSafeETHDP extends DataPrep {
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
