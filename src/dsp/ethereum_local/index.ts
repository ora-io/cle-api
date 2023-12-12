/* eslint-disable @typescript-eslint/no-unused-vars */
import type { KeyofToArray } from '@murongg/utils'
import type { Input } from '../../common/input'
import type { ZkGraphYaml } from '../../types/zkgyaml'
import { DataSourcePlugin } from '../interface'

// import { providers } from "ethers";
// import { getBlock } from "../../common/ethers_helper.js";
// import { trimPrefix } from "../../common/utils.js";

export class EthereumLocalDataSourcePlugin extends DataSourcePlugin<{}, {}, {}, {}> {
  prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: Record<string, any>): Promise<any> {
    throw new Error('Method not implemented.')
  }

  fillExecInput(input: Input, zkgraphYaml: ZkGraphYaml, dataPrep: {}) {
    return input
  }

  fillProveInput(input: Input, zkgraphYaml: ZkGraphYaml, dataPrep: {}) {
    return input
  }

  toProveDataPrep(execDataPrep: any, execResult: any) {
    return {}
  }

  execParams: KeyofToArray<{}> = []
  proveParams: KeyofToArray<{}> = []

  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum_local' }

  toPrepareParams(params: {}, type: 'exec'): Promise<{}>
  toPrepareParams(params: {}, type: 'prove'): Promise<{}>
  toPrepareParams(params: {}, type: 'exec' | 'prove'): Promise<{}>
  toPrepareParams(params: unknown, type: unknown): Promise<{}> {
    throw new Error('Method not implemented.')
  }
}
