import type { Input } from '../../common/input'
import type { CLEYaml } from '../../types/zkgyaml'
import { fillInputBlocksWithoutLatestBlockhash, fillInputEvents, setFillInputEventsFunc } from '../ethereum/fill_blocks'
import { unsafePrepareData } from '../ethereum.unsafe'
import { ExtendableEthereumDataSourcePlugin, safePrepareData } from '../ethereum'
import { unsafeFillInputEvents } from '../ethereum.unsafe/fill'
import { UnsafeSafeETHDP } from './dataprep'

export class UnsafeSafeETHDSP extends ExtendableEthereumDataSourcePlugin<UnsafeSafeETHDP> {
  constructor() {
    super()
  }

  // SHOULD align with cle-lib/dsp/<DSPName>
  // TODO unsafe
  getLibDSPName() { return 'ethereum.unsafe-ethereum' }

  async prepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
    const { contextBlocknumber, expectedStateStr } = prepareParams
    const unsafeEthDP = await unsafePrepareData(cleYaml, prepareParams)
    const safeEthDP = await safePrepareData(cleYaml, prepareParams)
    const dataPrep = new UnsafeSafeETHDP(unsafeEthDP, safeEthDP, contextBlocknumber, expectedStateStr)
    return dataPrep
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: UnsafeSafeETHDP) {
    // set unsafe func
    setFillInputEventsFunc(unsafeFillInputEvents)
    input = fillInputBlocksWithoutLatestBlockhash(input, cleYaml, dataPrep.unsafeETHDP.blockPrepMap, dataPrep.unsafeETHDP.blocknumberOrder)

    // set safe func
    setFillInputEventsFunc(fillInputEvents)
    input = fillInputBlocksWithoutLatestBlockhash(input, cleYaml, dataPrep.safeEthDP.blockPrepMap, dataPrep.safeEthDP.blocknumberOrder)

    input.addInt(dataPrep.contextBlocknumber, true)
    return input
  }
}
