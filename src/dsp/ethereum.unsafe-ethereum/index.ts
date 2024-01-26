import type { Input } from '../../common/input'
import type { CLEYaml } from '../../types/zkgyaml'
import { fillInputBlocksWithoutLatestBlockhash, fillInputEvents, setFillInputEventsFunc } from '../ethereum/fill_blocks'
import { unsafePrepareData } from '../ethereum.unsafe'
import { ExtendableEthereumDataSourcePlugin, safePrepareData } from '../ethereum'
import { unsafeFillInputEvents } from '../ethereum.unsafe/fill'
import { ETHUnsafe_ETH_DataPrep } from './dataprep'

export class ETHUnsafe_ETH_DSP extends ExtendableEthereumDataSourcePlugin<ETHUnsafe_ETH_DataPrep> {
  constructor() {
    super()
  }

  // SHOULD align with cle-lib/dsp/<DSPName>
  // TODO unsafe
  getLibDSPName() { return 'ethereum.unsafe-ethereum' }

  async prepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
    const { latestBlockhash, expectedStateStr } = prepareParams
    const unsafeEthDP = await unsafePrepareData(cleYaml, prepareParams)
    const safeEthDP = await safePrepareData(cleYaml, prepareParams)
    const dataPrep = new ETHUnsafe_ETH_DataPrep(unsafeEthDP, safeEthDP, latestBlockhash, expectedStateStr)
    return dataPrep
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: ETHUnsafe_ETH_DataPrep) {
    // set unsafe func
    setFillInputEventsFunc(unsafeFillInputEvents)
    input = fillInputBlocksWithoutLatestBlockhash(input, cleYaml, dataPrep.unsafeETHDP.blockPrepMap, dataPrep.unsafeETHDP.blocknumberOrder)

    // set safe func
    setFillInputEventsFunc(fillInputEvents)
    input = fillInputBlocksWithoutLatestBlockhash(input, cleYaml, dataPrep.safeEthDP.blockPrepMap, dataPrep.safeEthDP.blocknumberOrder)

    input.addHexString(dataPrep.latestBlockhash, true)
    return input
  }
}
