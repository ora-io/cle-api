import type { EthereumDataPrep } from '../ethereum/blockprep'
import type { UnsafeEthereumDataPrep } from '../ethereum.unsafe/dataprep'
import { DataPrep } from '../interface'

// includes both exec & prove params
export class UnsafeSafeETHDP extends DataPrep {
  unsafeETHDP: UnsafeEthereumDataPrep
  safeEthDP: EthereumDataPrep
  // contextBlocknumber & expectedStateStr should use these, not the ones in 2 xxxDataPreps
  contextBlocknumber: number
  constructor(ethUnsafeDP: UnsafeEthereumDataPrep, ethDP: EthereumDataPrep, contextBlocknumber: number, expectedStateStr: string) {
    super(expectedStateStr)
    this.unsafeETHDP = ethUnsafeDP
    this.safeEthDP = ethDP
    this.contextBlocknumber = contextBlocknumber

    // unify to avoid ambiguity
    this.unsafeETHDP.contextBlocknumber = contextBlocknumber
    this.unsafeETHDP.expectedStateStr = expectedStateStr
    this.safeEthDP.contextBlocknumber = contextBlocknumber
    this.safeEthDP.expectedStateStr = expectedStateStr
  }
}
