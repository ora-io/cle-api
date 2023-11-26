import { providers } from 'ethers'
import { DataPrep, DataSourcePlugin } from '../interface'

// reuse ethereum dsp for blocks
import { prepareBlocksByYaml } from '../ethereum/prepare_blocks'
import { fillInputBlocks } from '../ethereum/fill_blocks'

import { getBlock } from '../../common/ethers_helper'
import { dspParamsNormalize, trimPrefix } from '../../common/utils'
import type { ZkGraphYaml } from '../../types/zkgyaml'
import type { BlockPrep } from '../ethereum/blockprep'

export interface EthereumOffchainDPDataPrep {
  blockPrepMap: Map<number, BlockPrep>
  blocknumberOrder: any[]
  latestBlockhash: string
  offchainData: any
  expectedStateStr: string
}

export interface EthereumOffchainDSPPrepareParams {
  provider: providers.JsonRpcProvider
  latestBlocknumber: number
  latestBlockhash: string
  offchainData: any
  expectedStateStr: string | null
}
export interface EthereumOffchainDSPExecParams {
  jsonRpcUrl: string
  blockId: string
  offchainData: any
}

export interface EthereumOffchainDSPProveParams {
  jsonRpcUrl: string
  blockId: string
  offchainData: any
  expectedStateStr: string
}

export class EthereumOffchainDP extends DataPrep {
  blockPrepMap: any
  blocknumberOrder: any
  latestBlockhash: any
  offchainData: any
  expectedStateStr: any
  constructor(blockPrepMap: any, blocknumberOrder: any, latestBlockhash: any, offchainData: any, expectedStateStr: any) {
    super()
    this.blockPrepMap = blockPrepMap
    this.blocknumberOrder = blocknumberOrder
    this.latestBlockhash = latestBlockhash
    this.offchainData = offchainData
    this.expectedStateStr = expectedStateStr
  }
}

export class EthereumOffchainDSP extends DataSourcePlugin {
  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  static getLibDSPName() { return 'ethereum-offchain.bytes' }

  static async prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: EthereumOffchainDSPPrepareParams) {
    const { provider, latestBlocknumber, latestBlockhash, offchainData, expectedStateStr } = prepareParams
    const ethDP = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr || '', zkgraphYaml)
    return new EthereumOffchainDP(
      ethDP.blockPrepMap,
      ethDP.blocknumberOrder,
      ethDP.latestBlockhash,
      // add offchain data
      offchainData,
      ethDP.expectedStateStr,
    )
  }

  static fillExecInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumOffchainDPDataPrep) {
    input = fillInputBlocks(input, zkgraphYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
    // add offchain data
    input.addVarLenHexString(dataPrep.offchainData)
    return input
  }

  static fillProveInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumOffchainDPDataPrep) {
    this.fillExecInput(input, zkgraphYaml, dataPrep)
    // add offchain data
    input.addVarLenHexString(dataPrep.offchainData)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)
    return input
  }

  // TODO: copy instead of rename
  static toProveDataPrep(execDataPrep: EthereumOffchainDPDataPrep, execResult: string) {
    const proveDataPrep = execDataPrep
    proveDataPrep.expectedStateStr = execResult
    return proveDataPrep
  }

  static toPrepareParams(generalParams: EthereumOffchainDSPPrepareParams) {
    const { provider, latestBlocknumber, latestBlockhash, offchainData, expectedStateStr } = generalParams
    return {
      provider,
      latestBlocknumber,
      latestBlockhash,
      // add offchain data
      offchainData,
      expectedStateStr,
    }
  }

  static execParams = ['jsonRpcUrl', 'blockId', 'offchainData']

  static toExecParams(generalParams: Record<string, any>) {
    return dspParamsNormalize(this.execParams, generalParams) as EthereumOffchainDSPExecParams
  }

  static proveParams = ['jsonRpcUrl', 'blockId', 'offchainData', 'expectedStateStr']

  static toProveParams(generalParams: Record<string, any>) {
    return dspParamsNormalize(this.proveParams, generalParams) as EthereumOffchainDSPProveParams
  }

  static async toPrepareParamsFromExecParams(execParams: EthereumOffchainDSPExecParams): Promise<EthereumOffchainDSPPrepareParams> {
    const { jsonRpcUrl, blockId, offchainData } = execParams

    const provider = new providers.JsonRpcProvider(jsonRpcUrl)

    // Get block
    // TODO: optimize: no need to getblock if blockId is block num
    const rawblock = await getBlock(provider, blockId)
    const blockNumber = parseInt(rawblock.number)
    const blockHash = rawblock.hash

    return {
      provider,
      latestBlocknumber: blockNumber,
      latestBlockhash: blockHash,
      // add offchain data
      offchainData,
      expectedStateStr: null,
    }
  }

  static async toPrepareParamsFromProveParams(proveParams: EthereumOffchainDSPProveParams): Promise<EthereumOffchainDSPPrepareParams> {
    const { jsonRpcUrl, blockId, offchainData, expectedStateStr } = proveParams

    const provider = new providers.JsonRpcProvider(jsonRpcUrl)

    // Get block
    // TODO: optimize: no need to getblock if blockId is block num
    const rawblock = await getBlock(provider, blockId)
    const blockNumber = parseInt(rawblock.number)
    const blockHash = rawblock.hash

    return {
      provider,
      latestBlocknumber: blockNumber,
      latestBlockhash: blockHash,
      // add offchain data
      offchainData,
      expectedStateStr,
    }
  }
}
