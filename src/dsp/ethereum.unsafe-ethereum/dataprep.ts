import type { EthereumDataPrep } from '../ethereum/blockprep'
import type { UnsafeEthereumDataPrep } from '../ethereum.unsafe/dataprep'
import { DataPrep } from '../interface'

// includes both exec & prove params
export class UnsafeSafeETHDP extends DataPrep {
  unsafeETHDP: UnsafeEthereumDataPrep
  safeEthDP: EthereumDataPrep
  // latestBlocknumber & expectedStateStr should use these, not the ones in 2 xxxDataPreps
  latestBlocknumber: number
  constructor(ethUnsafeDP: UnsafeEthereumDataPrep, ethDP: EthereumDataPrep, latestBlocknumber: number, expectedStateStr: string) {
    super(expectedStateStr)
    this.unsafeETHDP = ethUnsafeDP
    this.safeEthDP = ethDP
    this.latestBlocknumber = latestBlocknumber

    // unify to avoid ambiguity
    this.unsafeETHDP.latestBlocknumber = latestBlocknumber
    this.unsafeETHDP.expectedStateStr = expectedStateStr
    this.safeEthDP.latestBlocknumber = latestBlocknumber
    this.safeEthDP.expectedStateStr = expectedStateStr
  }
}
