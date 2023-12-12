import type { KeyofToArray } from '@murongg/utils/index'
import type { providers } from 'ethers'
import { DataPrep, DataSourcePlugin } from '../interface'

// reuse ethereum dsp for blocks
import { fillInputBlocks } from '../ethereum/fill_blocks'
import { prepareBlocksByYaml } from '../ethereum/prepare_blocks'

import { getBlock } from '../../common/ethers_helper'
import { trimPrefix } from '../../common/utils'
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
  provider: providers.JsonRpcProvider
  blockId: string
  offchainData: any
}

export interface EthereumOffchainDSPProveParams {
  provider: providers.JsonRpcProvider
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

export class EthereumOffchainDSP extends DataSourcePlugin<EthereumOffchainDSPExecParams, EthereumOffchainDSPProveParams> {
  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum-offchain.bytes' }

  async prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: EthereumOffchainDSPPrepareParams) {
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

  fillExecInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumOffchainDPDataPrep) {
    input = fillInputBlocks(input, zkgraphYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
    // add offchain data
    input.addVarLenHexString(dataPrep.offchainData)
    return input
  }

  fillProveInput(input: any, zkgraphYaml: ZkGraphYaml, dataPrep: EthereumOffchainDPDataPrep) {
    this.fillExecInput(input, zkgraphYaml, dataPrep)
    // add offchain data
    input.addVarLenHexString(dataPrep.offchainData)
    // add expected State Str
    const expectedStateStr = trimPrefix(dataPrep.expectedStateStr, '0x')
    input.addVarLenHexString(expectedStateStr, true)
    return input
  }

  // TODO: copy instead of rename
  toProveDataPrep(execDataPrep: EthereumOffchainDPDataPrep, execResult: string) {
    const proveDataPrep = execDataPrep
    proveDataPrep.expectedStateStr = execResult
    return proveDataPrep
  }

  toPrepareParams(generalParams: EthereumOffchainDSPPrepareParams) {
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

  execParams: KeyofToArray<EthereumOffchainDSPExecParams> = ['blockId', 'offchainData']
  proveParams: KeyofToArray<EthereumOffchainDSPProveParams> = ['blockId', 'offchainData', 'expectedStateStr']

  async toPrepareParamsFromExecParams(execParams: EthereumOffchainDSPExecParams): Promise<EthereumOffchainDSPPrepareParams> {
    const { provider, blockId, offchainData } = execParams

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

  async toPrepareParamsFromProveParams(proveParams: EthereumOffchainDSPProveParams): Promise<EthereumOffchainDSPPrepareParams> {
    const { provider, blockId, offchainData, expectedStateStr } = proveParams

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
