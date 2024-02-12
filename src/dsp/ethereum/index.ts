import type { KeyofToArray } from '@murongg/utils/index'
import type { providers } from 'ethers'
import type { Input } from '../../common/input'
import { trimPrefix } from '../../common/utils'
import type { CLEYaml } from '../../types/zkgyaml'
import type { DataPrep } from '../interface'
import { DataSourcePlugin } from '../interface'
import { dspHooks } from '../hooks'
import type { EthereumDataPrep } from './blockprep'
import { fillInputBlocks, fillInputEvents, setFillInputEventsFunc } from './fill_blocks'
import { prepareBlocksByYaml, prepareOneBlock, setPrePareOneBlockFunc } from './prepare_blocks'
import { genAuxParams } from './aux'

export { EthereumDataPrep } from './blockprep'

export interface EthereumDSPPrepareParams {
  provider: providers.JsonRpcProvider
  contextBlocknumber: number
  contextBlockhash: string
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

export abstract class ExtendableEthereumDataSourcePlugin<X extends DataPrep> extends DataSourcePlugin<EthereumDSPExecParams, EthereumDSPProveParams, EthereumDSPPrepareParams, X> {
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
    const rawblock = await dspHooks.getBlock(provider, blockId)
    const blockNumber = parseInt(rawblock.number)
    // const blockHash = rawblock.hash

    return {
      provider,
      contextBlocknumber: blockNumber,
      // contextBlockhash: blockHash,
      contextBlockhash: '-deprecate-',
      expectedStateStr,
    }
  }

  fillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: X) {
    this.fillExecInput(input, cleYaml, dataPrep, true)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)
    return input
  }

  // TODO: copy instead of rename
  toProveDataPrep(execDataPrep: X, execResult: string) {
    const proveDataPrep = execDataPrep
    proveDataPrep.expectedStateStr = execResult
    return proveDataPrep
  }
}

export class EthereumDataSourcePlugin extends ExtendableEthereumDataSourcePlugin<EthereumDataPrep> {
  // SHOULD align with cle-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum' }

  async prepareData(cleYaml: CLEYaml, prepareParams: EthereumDSPPrepareParams) {
    return safePrepareData(cleYaml, prepareParams)
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: EthereumDataPrep, enableLog = true) {
    // set safe func
    setFillInputEventsFunc(fillInputEvents)
    return fillInputBlocks(input, cleYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.contextBlocknumber, enableLog)
  }

  fillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: EthereumDataPrep) {
    input = super.fillProveInput(input, cleYaml, dataPrep)
    input.auxParams = genAuxParams(cleYaml, dataPrep)
    return input
  }
}

export async function safePrepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
  const { provider, contextBlocknumber, contextBlockhash, expectedStateStr } = prepareParams
  setPrePareOneBlockFunc(prepareOneBlock)

  const dataPrep = await prepareBlocksByYaml(provider, contextBlocknumber, contextBlockhash, expectedStateStr || '', cleYaml)
  return dataPrep
}
