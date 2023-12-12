// - prepare data from yaml
// - fill input
// - prep structure

import type { KeyofToArray } from '@murongg/utils'
import { dspParamsNormalize } from '../common/utils'
import type { ZkGraphYaml } from '../types/zkgyaml'

export class DataPrep {}

export abstract class DataSourcePlugin<EP extends object, PP extends object> {
  abstract getLibDSPName(): string
  abstract prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: Record<string, any>): Promise<any>
  abstract fillExecInput(input: any, zkgraphYaml: any, dataPrep: any): any
  abstract fillProveInput(input: any, zkgraphYaml: any, dataPrep: any): any
  abstract toProveDataPrep(execDataPrep: any, execResult: any): any
  abstract toPrepareParams(...args: any[]): any
  abstract execParams: KeyofToArray<EP>
  toExecParams(params: Record<string, any>) {
    return dspParamsNormalize(this.execParams as string[], params) as EP
  }

  abstract proveParams: KeyofToArray<PP>
  toProveParams(params: Record<string, any>) {
    return dspParamsNormalize(this.proveParams as string[], params) as PP
  }
  abstract toPrepareParamsFromExecParams(execParams: any): Promise<any>
  abstract toPrepareParamsFromProveParams(proveParams: any): Promise<any>
}
