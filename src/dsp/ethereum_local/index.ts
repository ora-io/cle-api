/* eslint-disable @typescript-eslint/no-unused-vars */
import type { KeyofToArray } from '@murongg/utils'
import type { ZkGraphYaml } from '../../types/zkgyaml'
import { DataSourcePlugin } from '../interface'

// import { providers } from "ethers";
// import { getBlock } from "../../common/ethers_helper.js";
// import { trimPrefix } from "../../common/utils.js";

export class EthereumLocalDataSourcePlugin extends DataSourcePlugin<{}, {}> {
  prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: Record<string, any>): Promise<any> {
    throw new Error('Method not implemented.')
  }

  fillExecInput(input: any, zkgraphYaml: any, dataPrep: any) {
    throw new Error('Method not implemented.')
  }

  fillProveInput(input: any, zkgraphYaml: any, dataPrep: any) {
    throw new Error('Method not implemented.')
  }

  toProveDataPrep(execDataPrep: any, execResult: any) {
    throw new Error('Method not implemented.')
  }

  toPrepareParams(...args: any[]) {
    throw new Error('Method not implemented.')
  }

  execParams: KeyofToArray<{}> = []
  proveParams: KeyofToArray<{}> = []
  toPrepareParamsFromExecParams(execParams: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  toPrepareParamsFromProveParams(proveParams: any): Promise<any> {
    throw new Error('Method not implemented.')
  }

  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  getLibDSPName() { return 'ethereum_local' }
}
