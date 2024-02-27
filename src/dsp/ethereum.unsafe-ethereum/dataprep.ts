import type { EthereumDataPrep } from '../ethereum/blockprep'
import type { UnsafeEthereumDataPrep } from '../ethereum.unsafe/dataprep'
import { DataPrep } from '../interface'

// includes both exec & prove params
export class UnsafeSafeETHDP extends DataPrep {
  unsafeETHDP: UnsafeEthereumDataPrep
  safeEthDP: EthereumDataPrep
  // contextBlocknumber & expectedStateStr should use these, not the ones in 2 xxxDataPreps
  contextBlocknumber: number
  latestBlocknumber: number
  constructor(ethUnsafeDP: UnsafeEthereumDataPrep, ethDP: EthereumDataPrep, contextBlocknumber: number, expectedStateStr: string, latestBlocknumber: number) {
    super(expectedStateStr)
    this.unsafeETHDP = ethUnsafeDP
    this.safeEthDP = ethDP
    this.contextBlocknumber = contextBlocknumber
    this.latestBlocknumber = latestBlocknumber

    // unify to avoid ambiguity, useless
    this.unsafeETHDP.contextBlocknumber = contextBlocknumber
    this.unsafeETHDP.expectedStateStr = expectedStateStr
    this.unsafeETHDP.latestBlocknumber = latestBlocknumber
    this.safeEthDP.contextBlocknumber = contextBlocknumber
    this.safeEthDP.expectedStateStr = expectedStateStr
    this.safeEthDP.latestBlocknumber = latestBlocknumber
  }
}
