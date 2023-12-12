import type { KeyofToArray } from '@murongg/utils/index'
import type { providers } from 'ethers'
import { getBlock } from '../../common/ethers_helper'
import { trimPrefix } from '../../common/utils'
import type { ZkGraphYaml } from '../../types/zkgyaml'
import { DataSourcePlugin } from '../interface'
import type { EthereumDataPrep } from './blockprep'
import { fillInputBlocks } from './fill_blocks'
import { prepareBlocksByYaml } from './prepare_blocks'

export { EthereumDataPrep } from './blockprep'

export type EthereumDataSourcePluginPrepareParams = EthereumDSPPrepareParams
export interface EthereumDSPPrepareParams {
  provider: providers.JsonRpcProvider
  latestBlocknumber: number
  latestBlockhash: string
  expectedStateStr: string | null
}

export type EthereumDataSourcePluginExecParams = EthereumDSPExecParams
export interface EthereumDSPExecParams {
  provider: providers.JsonRpcProvider
  blockId: string
}

export type EthereumDataSourcePluginProveParams = EthereumDSPProveParams
export interface EthereumDSPProveParams {
  provider: providers.JsonRpcProvider
  blockId: string
  expectedStateStr: string
}

export class EthereumDataSourcePlugin extends DataSourcePlugin<EthereumDSPExecParams, EthereumDSPProveParams, EthereumDSPPrepareParams> {
  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum' }

  async prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: EthereumDSPPrepareParams) {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams
    const dataPrep = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', zkgraphYaml)
    return dataPrep
  }

  fillExecInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumDataPrep) {
    return fillInputBlocks(input, zkgraphYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
  }

  fillProveInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumDataPrep) {
    this.fillExecInput(input, zkgraphYaml, dataPrep)
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

  async toPrepareParamsFromExecParams(execParams: EthereumDSPExecParams) {
    const { provider, blockId } = execParams

    // Get block
    // TODO: optimize: no need to getblock if blockId is block num
    const rawblock = await getBlock(provider, blockId)
    const blockNumber = parseInt(rawblock.number)
    const blockHash = rawblock.hash

    return {
      provider,
      latestBlocknumber: blockNumber,
      latestBlockhash: blockHash,
      expectedStateStr: null,
    }
  }

  async toPrepareParamsFromProveParams(proveParams: EthereumDSPProveParams) {
    const { provider, blockId, expectedStateStr } = proveParams

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
