import type { providers } from 'ethers'
import { DataSourcePlugin } from '../interface'
import { getBlock } from '../../common/ethers_helper'
import { dspParamsNormalize, trimPrefix } from '../../common/utils'
import type { ZkGraphYaml } from '../../types/zkgyaml'
import { prepareBlocksByYaml } from './prepare_blocks'
import { fillInputBlocks } from './fill_blocks'
import type { EthereumDataPrep } from './blockprep'

export { EthereumDataPrep } from './blockprep'

export interface EthereumDataSourcePluginPrepareParams {
  provider: providers.JsonRpcProvider
  latestBlocknumber: number
  latestBlockhash: string
  expectedStateStr: string | null
}

export interface EthereumDataSourcePluginDataPrep {
  blockPrepMap: Map<number, any>
  blocknumberOrder: number[]
  latestBlockhash: string
  expectedStateStr: string
}

export interface EthereumDataSourcePluginExecParams {
  provider: providers.JsonRpcProvider
  blockId: string
}

export interface EthereumDataSourcePluginProveParams {
  provider: providers.JsonRpcProvider
  blockId: string
  expectedStateStr: string
}

export class EthereumDataSourcePlugin extends DataSourcePlugin {
  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  static getLibDSPName() { return 'ethereum' }

  static async prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: EthereumDataSourcePluginPrepareParams) {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams
    const dataPrep = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', zkgraphYaml)
    return dataPrep
  }

  static fillExecInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumDataSourcePluginDataPrep) {
    return fillInputBlocks(input, zkgraphYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
  }

  static fillProveInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumDataSourcePluginDataPrep) {
    this.fillExecInput(input, zkgraphYaml, dataPrep)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)
    return input
  }

  // TODO: copy instead of rename
  static toProveDataPrep(execDataPrep: EthereumDataPrep, execResult: string) {
    const proveDataPrep = execDataPrep
    proveDataPrep.expectedStateStr = execResult
    return proveDataPrep
  }

  // validate params exist
  static toPrepareParams(generalParams: EthereumDataSourcePluginPrepareParams): EthereumDataSourcePluginPrepareParams {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = generalParams
    return {
      provider,
      latestBlocknumber,
      latestBlockhash,
      expectedStateStr,
    }
  }

  static execParams = ['provider', 'blockId']

  // validate params exist // TODO: move to DataSourcePlugin as shared methods?
  static toExecParams(generalParams: Record<string, any>): EthereumDataSourcePluginExecParams {
    return dspParamsNormalize(this.execParams, generalParams) as EthereumDataSourcePluginExecParams
  }

  static proveParams = ['provider', 'blockId', 'expectedStateStr']

  // validate params exist
  static toProveParams(generalParams: Record<string, any>): EthereumDataSourcePluginProveParams {
    return dspParamsNormalize(this.proveParams, generalParams) as EthereumDataSourcePluginProveParams
  }

  static async toPrepareParamsFromExecParams(execParams: EthereumDataSourcePluginExecParams): Promise<EthereumDataSourcePluginPrepareParams> {
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

  static async toPrepareParamsFromProveParams(proveParams: EthereumDataSourcePluginProveParams): Promise<EthereumDataSourcePluginPrepareParams> {
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
