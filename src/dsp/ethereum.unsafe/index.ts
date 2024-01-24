/* eslint-disable @typescript-eslint/no-unused-vars */
import type { KeyofToArray } from '@murongg/utils'
import type { Input } from '../../common/input'
import type { CLEYaml } from '../../types/zkgyaml'
import type { DataPrep } from '../interface'
import { DataSourcePlugin } from '../interface'
import type { EthereumDSPExecParams, EthereumDSPPrepareParams, EthereumDSPProveParams } from '../ethereum'
import { EthereumDataSourcePlugin } from '../ethereum'
import { trimPrefix } from '../../common/utils'
import { getBlock } from '../../common/ethers_helper'
import { fillInputBlocks, setFillInputEventsFunc } from '../ethereum/fill_blocks'
import { prepareBlocksByYaml, setPrePareOneBlockFunc } from '../ethereum/prepare_blocks'
import { fillInputEventsUnsafe } from './fill'
import type { EthereumUnsafeDataPrep } from './dataprep'
import { prepareOneBlockUnsafe } from './prepare'

export class EthereumUnsafeDataSourcePlugin<UnsafeDataPrep extends EthereumUnsafeDataPrep> extends DataSourcePlugin<EthereumDSPExecParams, EthereumDSPProveParams, EthereumDSPPrepareParams, UnsafeDataPrep> {
  // SHOULD align with cle-lib/dsp/<DSPName>
  // TODO unsafe
  getLibDSPName() { return 'ethereum.unsafe' }

  async prepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
    return this.unsafePrepareData(cleYaml, prepareParams)
  }

  protected async unsafePrepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>) {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams
    setPrePareOneBlockFunc(prepareOneBlockUnsafe)

    const dataPrep = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', cleYaml)
    return dataPrep as UnsafeDataPrep
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: UnsafeDataPrep) {
    return this.unsafeFillExecInput(input, cleYaml, dataPrep)
  }

  protected unsafeFillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: UnsafeDataPrep) {
    // set unsafe func
    setFillInputEventsFunc(fillInputEventsUnsafe)

    return fillInputBlocks(input, cleYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
  }

  fillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: UnsafeDataPrep) {
    return this.unsafeFillProveInput(input, cleYaml, dataPrep)
  }

  unsafeFillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: UnsafeDataPrep) {
    this.fillExecInput(input, cleYaml, dataPrep)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)
    return input
  }

  toProveDataPrep(execDataPrep: UnsafeDataPrep, execResult: any) {
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
