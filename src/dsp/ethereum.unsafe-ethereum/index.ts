import type { Input } from '../../common/input'
import type { CLEYaml } from '../../types/zkgyaml'
import { fillInputBlocksWithoutLatestBlockhash, fillInputEvents, setFillInputEventsFunc } from '../ethereum/fill_blocks'
import { prepareBlocksByYaml, prepareOneBlock, setPrePareOneBlockFunc } from '../ethereum/prepare_blocks'
import { EthereumUnsafeDataSourcePlugin } from '../ethereum.unsafe'
import type { EthereumUnsafeDataPrep } from '../ethereum.unsafe/dataprep'
import { ETHUnsafe_ETH_DataPrep } from './dataprep'

export class ETHUnsafe_ETH_DSP extends EthereumUnsafeDataSourcePlugin<ETHUnsafe_ETH_DataPrep extends EthereumUnsafeDataPrep ? ETHUnsafe_ETH_DataPrep : any> {
  constructor() {
    super()
  }

  // SHOULD align with cle-lib/dsp/<DSPName>
  // TODO unsafe
  getLibDSPName() { return 'ethereum.unsafe-ethereum' }

  async prepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
    const ethUnsafeDP = await this.unsafePrepareData(cleYaml, prepareParams)
    return this.safePrepareData(cleYaml, prepareParams, ethUnsafeDP)
  }

  protected async safePrepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>, ethUnsafeDP: EthereumUnsafeDataPrep) {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams

    // set safe func
    setPrePareOneBlockFunc(prepareOneBlock)
    const ethDP = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', cleYaml)

    const dataPrep = new ETHUnsafe_ETH_DataPrep(ethUnsafeDP, ethDP, latestBlockhash, expectedStateStr)
    return dataPrep
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: ETHUnsafe_ETH_DataPrep) {
    input = this.unsafeFillExecInput(input, cleYaml, dataPrep)
    return this.safeFillExecInput(input, cleYaml, dataPrep)
  }

  protected safeFillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: ETHUnsafe_ETH_DataPrep) {
    // set safe func
    setFillInputEventsFunc(fillInputEvents)
    input = fillInputBlocksWithoutLatestBlockhash(input, cleYaml, dataPrep.ethDP.blockPrepMap, dataPrep.ethDP.blocknumberOrder)

    input.addHexString(dataPrep.latestBlockhash, true)
    return input
  }
}
