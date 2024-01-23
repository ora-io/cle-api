import type { KeyofToArray } from '@murongg/utils'
import type { Input } from '../../common/input'
import type { CLEYaml } from '../../types/zkgyaml'
import { DataSourcePlugin } from '../interface'
import type { EthereumDSPExecParams, EthereumDSPPrepareParams, EthereumDSPProveParams } from '../ethereum'
import { trimPrefix } from '../../common/utils'
import { getBlock } from '../../common/ethers_helper'
import { fillInputBlocksWithoutLatestBlockhash, fillInputEvents, setFillInputEventsFunc } from '../ethereum/fill_blocks'
import { prepareBlocksByYaml, prepareOneBlock, setPrePareOneBlockFunc } from '../ethereum/prepare_blocks'
import { prepareOneBlockUnsafe } from '../ethereum.unsafe/prepare'
import { fillInputEventsUnsafe } from '../ethereum.unsafe/fill'
import { ETHUnsafe_ETH_DataPrep } from './dataprep'

export class ETHUnsafe_ETH_DSP extends DataSourcePlugin<EthereumDSPExecParams, EthereumDSPProveParams, EthereumDSPPrepareParams, ETHUnsafe_ETH_DataPrep> {
  // SHOULD align with cle-lib/dsp/<DSPName>
  // TODO unsafe
  getLibDSPName() { return 'ethereum.unsafe-ethereum' }

  async prepareData(cleYaml: CLEYaml, prepareParams: Record<string, any>): Promise<any> {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams
    // set unsafe func
    setPrePareOneBlockFunc(prepareOneBlockUnsafe)
    const ethUnsafeDP = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', cleYaml)

    // set safe func
    setPrePareOneBlockFunc(prepareOneBlock)
    const ethDP = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', cleYaml)

    const dataPrep = new ETHUnsafe_ETH_DataPrep(ethUnsafeDP, ethDP, latestBlockhash, expectedStateStr)

    return dataPrep
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: ETHUnsafe_ETH_DataPrep) {
    // set unsafe func
    setFillInputEventsFunc(fillInputEventsUnsafe)
    input = fillInputBlocksWithoutLatestBlockhash(input, cleYaml, dataPrep.ethUnsafeDP.blockPrepMap, dataPrep.ethUnsafeDP.blocknumberOrder)

    // set safe func
    setFillInputEventsFunc(fillInputEvents)
    input = fillInputBlocksWithoutLatestBlockhash(input, cleYaml, dataPrep.ethDP.blockPrepMap, dataPrep.ethDP.blocknumberOrder)

    input.addHexString(dataPrep.latestBlockhash, true)

    return input
  }

  fillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: ETHUnsafe_ETH_DataPrep) {
    this.fillExecInput(input, cleYaml, dataPrep)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)

    return input
  }

  toProveDataPrep(execDataPrep: ETHUnsafe_ETH_DataPrep, execResult: any) {
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
