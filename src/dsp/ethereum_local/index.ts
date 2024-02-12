/* eslint-disable @typescript-eslint/no-unused-vars */
import type { KeyofToArray } from '@murongg/utils'
import type { Input } from '../../common/input'
import type { CLEYaml } from '../../types/zkgyaml'
import { DataSourcePlugin } from '../interface'
import type { EthereumDSPExecParams, EthereumDSPPrepareParams, EthereumDSPProveParams } from '../ethereum'
import { trimPrefix } from '../../common/utils'
import { fillInputBlocks, setFillInputEventsFunc } from '../ethereum/fill_blocks'
import { prepareBlocksByYaml, setPrePareOneBlockFunc } from '../ethereum/prepare_blocks'
import { dspHooks } from '../hooks'
import { fillInputEvents } from './fill_blocks'
import type { EthereumLocalDataPrep } from './dataprep'
import { prepareOneBlockLocal } from './prepare_blocks'

export class EthereumLocalDataSourcePlugin extends DataSourcePlugin<EthereumDSPExecParams, EthereumDSPProveParams, EthereumDSPPrepareParams, EthereumLocalDataPrep> {
  // SHOULD align with cle-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum_local' }

  async prepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>): Promise<any> {
    const { provider, contextBlocknumber, contextBlockhash, expectedStateStr } = prepareParams
    // set local func
    setPrePareOneBlockFunc(prepareOneBlockLocal)

    const dataPrep = await prepareBlocksByYaml(provider, contextBlocknumber, contextBlockhash, expectedStateStr || '', cleYaml)
    return dataPrep
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: EthereumLocalDataPrep, enableLog = false) {
    // set local func
    setFillInputEventsFunc(fillInputEvents)

    return fillInputBlocks(input, cleYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.contextBlockhash)
  }

  fillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: EthereumLocalDataPrep) {
    this.fillExecInput(input, cleYaml, dataPrep)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)
    return input
  }

  toProveDataPrep(execDataPrep: EthereumLocalDataPrep, execResult: any) {
    const proveDataPrep = execDataPrep
    proveDataPrep.expectedStateStr = execResult
    return proveDataPrep
  }

  execParams: KeyofToArray<EthereumDSPExecParams> = ['provider', 'blockId']
  proveParams: KeyofToArray<EthereumDSPProveParams> = ['provider', 'blockId', 'expectedStateStr']

  // toPrepareParams(params: {}, type: 'exec'): Promise<{}>
  // toPrepareParams(params: {}, type: 'prove'): Promise<{}>
  // toPrepareParams(params: {}, type: 'exec' | 'prove'): Promise<{}>
  // toPrepareParams(params: unknown, type: unknown): Promise<{}> {

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
    const blockHash = rawblock.hash

    return {
      provider,
      contextBlocknumber: blockNumber,
      // contextBlockhash: blockHash,
      contextBlockhash: '-deprecate-',
      expectedStateStr,
    }
  }
}
