import type { KeyofToArray } from '@murongg/utils/index'
import type { providers } from 'ethers'
import { getBlock } from '../../common/ethers_helper'
import type { Input } from '../../common/input'
import { trimPrefix } from '../../common/utils'
import type { CLEYaml } from '../../types/zkgyaml'
import { DataSourcePlugin } from '../interface'
import type { EthereumDataPrep } from './blockprep'
import { fillInputBlocks } from './fill_blocks'
import { prepareBlocksByYaml } from './prepare_blocks'

export { EthereumDataPrep } from './blockprep'

export interface EthereumDSPPrepareParams {
  provider: providers.JsonRpcProvider
  latestBlocknumber: number
  latestBlockhash: string
  expectedStateStr: string
}

export interface EthereumDSPExecParams {
  provider: providers.JsonRpcProvider
  blockId: string
}

export interface EthereumDSPProveParams {
  provider: providers.JsonRpcProvider
  blockId: string
  expectedStateStr: string
}

export class EthereumDataSourcePlugin extends DataSourcePlugin<EthereumDSPExecParams, EthereumDSPProveParams, EthereumDSPPrepareParams, EthereumDataPrep> {
  // SHOULD align with cle-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum' }

  async prepareData(cleYaml: CLEYaml, prepareParams: EthereumDSPPrepareParams) {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams
    const dataPrep = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', cleYaml)
    return dataPrep
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: EthereumDataPrep) {
    return fillInputBlocks(input, cleYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
  }

  fillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: EthereumDataPrep) {
    this.fillExecInput(input, cleYaml, dataPrep)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)
    return input
  }

  // TODO: copy instead of rename
  toProveDataPrep(execDataPrep: EthereumDataPrep, execResult: string) {
    const proveDataPrep = execDataPrep
    proveDataPrep.expectedStateStr = execResult
    return proveDataPrep
  }

  execParams: KeyofToArray<EthereumDSPExecParams> = ['provider', 'blockId']
  proveParams: KeyofToArray<EthereumDSPProveParams> = ['provider', 'blockId', 'expectedStateStr']

  async toPrepareParams(params: EthereumDSPExecParams, type: 'exec'): Promise<EthereumDSPPrepareParams>
  async toPrepareParams(params: EthereumDSPProveParams, type: 'prove'): Promise<EthereumDSPPrepareParams>
  async toPrepareParams(params: EthereumDSPExecParams | EthereumDSPProveParams, type: 'exec' | 'prove') {
    let expectedStateStr = ''
    const { provider, blockId } = params
    if (type === 'prove')
      expectedStateStr = (params as EthereumDSPProveParams).expectedStateStr || ''

    // Get block
    // TODO: optimize: no need to getblock if blockId is block num
    const rawblock = await getBlock(provider, blockId)
    const blockNumber = parseInt(rawblock.number)
    const blockHash = rawblock.hash

    return {
      provider,
      latestBlocknumber: blockNumber,
      latestBlockhash: blockHash,
      expectedStateStr,
    }
  }
}
