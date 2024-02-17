import type { Input } from 'zkwasm-toolchain'
import type { CLEYaml } from '../../types/zkgyaml'
import { ExtendableEthereumDataSourcePlugin } from '../ethereum'
import { fillInputBlocks, setFillInputEventsFunc } from '../ethereum/fill_blocks'
import { prepareBlocksByYaml, setPrePareOneBlockFunc } from '../ethereum/prepare_blocks'
import { unsafeFillInputEvents } from './fill'
import type { UnsafeEthereumDataPrep } from './dataprep'
import { unsafePrepareOneBlock } from './prepare'

export class EthereumUnsafeDataSourcePlugin extends ExtendableEthereumDataSourcePlugin<UnsafeEthereumDataPrep> {
  // SHOULD align with cle-lib/dsp/<DSPName>
  // TODO unsafe
  getLibDSPName() { return 'ethereum.unsafe' }

  async prepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
    return unsafePrepareData(cleYaml, prepareParams)
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: UnsafeEthereumDataPrep) {
    return unsafeFillExecInput(input, cleYaml, dataPrep)
  }
}

export async function unsafePrepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
  const { provider, contextBlocknumber, expectedStateStr } = prepareParams
  setPrePareOneBlockFunc(unsafePrepareOneBlock)

  const dataPrep = await prepareBlocksByYaml(provider, contextBlocknumber, expectedStateStr || '', cleYaml)
  return dataPrep
}

export function unsafeFillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: UnsafeEthereumDataPrep) {
  // set unsafe func
  setFillInputEventsFunc(unsafeFillInputEvents)
  return fillInputBlocks(input, cleYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.contextBlocknumber)
}
