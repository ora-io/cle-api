import type { KeyofToArray } from '@murongg/utils/index'
import type { providers } from 'ethers'
import type { Input } from 'zkwasm-toolchain'
import { DataPrep, DataSourcePlugin } from '../interface'

// reuse ethereum dsp for blocks
import { fillInputBlocks } from '../ethereum/fill_blocks'
import { prepareBlocksByYaml } from '../ethereum/prepare_blocks'

import { trimPrefix } from '../../common/utils'
import type { CLEYaml } from '../../types'
import type { BlockPrep } from '../ethereum/blockprep'
import { dspHooks } from '../hooks'

export interface EthereumOffchainDPDataPrep {
  blockPrepMap: Map<number, BlockPrep>
  blocknumberOrder: any[]
  contextBlocknumber: number
  offchainData: any
  expectedStateStr: string
}

export interface EthereumOffchainDSPPrepareParams {
  provider: providers.JsonRpcProvider
  contextBlocknumber: number
  // contextBlockhash: string
  offchainData: any
  expectedStateStr: string
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
  contextBlocknumber: any
  offchainData: any
  expectedStateStr: any
  constructor(blockPrepMap: any, blocknumberOrder: any, contextBlocknumber: any, offchainData: any, expectedStateStr: any) {
    super(expectedStateStr)
    this.blockPrepMap = blockPrepMap
    this.blocknumberOrder = blocknumberOrder
    this.contextBlocknumber = contextBlocknumber
    this.offchainData = offchainData
    this.expectedStateStr = expectedStateStr
  }
}

export class EthereumOffchainDSP extends DataSourcePlugin<EthereumOffchainDSPExecParams, EthereumOffchainDSPProveParams, EthereumOffchainDSPPrepareParams, EthereumOffchainDPDataPrep> {
  // SHOULD align with cle-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum-offchain.bytes' }

  async prepareData(cleYaml: CLEYaml, prepareParams: EthereumOffchainDSPPrepareParams) {
    const { provider, contextBlocknumber, offchainData, expectedStateStr } = prepareParams
    const ethDP = await prepareBlocksByYaml(provider, contextBlocknumber, expectedStateStr || '', cleYaml)
    return new EthereumOffchainDP(
      ethDP.blockPrepMap,
      ethDP.blocknumberOrder,
      ethDP.contextBlocknumber,
      // add offchain data
      offchainData,
      ethDP.expectedStateStr,
    )
  }

  fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: EthereumOffchainDPDataPrep) {
    input = fillInputBlocks(input, cleYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.contextBlocknumber)
    // add offchain data
    input.addVarLenHexString(dataPrep.offchainData)
    return input
  }

  fillProveInput(input: any, cleYaml: CLEYaml, dataPrep: EthereumOffchainDPDataPrep) {
    this.fillExecInput(input, cleYaml, dataPrep)
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

  execParams: KeyofToArray<EthereumOffchainDSPExecParams> = ['blockId', 'offchainData']
  proveParams: KeyofToArray<EthereumOffchainDSPProveParams> = ['blockId', 'offchainData', 'expectedStateStr']

  async toPrepareParams(params: EthereumOffchainDSPExecParams, type: 'exec'): Promise<EthereumOffchainDSPPrepareParams>
  async toPrepareParams(params: EthereumOffchainDSPProveParams, type: 'prove'): Promise<EthereumOffchainDSPPrepareParams>
  async toPrepareParams(params: EthereumOffchainDSPExecParams | EthereumOffchainDSPProveParams, type: 'exec' | 'prove'): Promise<EthereumOffchainDSPPrepareParams> {
    let expectedStateStr = ''
    const { provider, blockId, offchainData } = params
    if (type === 'prove')
      expectedStateStr = (params as EthereumOffchainDSPProveParams).expectedStateStr || ''

    // Get block
    // TODO: optimize: no need to getblock if blockId is block num
    const rawblock = await dspHooks.getBlock(provider, blockId)
    const blockNumber = parseInt(rawblock.number)
    // const blockHash = rawblock.hash

    return {
      provider,
      contextBlocknumber: blockNumber,
      // contextBlockhash: '-deprecate-',
      // add offchain data
      offchainData,
      expectedStateStr,
    }
  }
}
