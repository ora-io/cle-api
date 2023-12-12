// - prepare data from yaml
// - fill input
// - prep structure

import type { KeyofToArray } from '@murongg/utils'
import type { Input } from '../common/input'
import { dspParamsNormalize } from '../common/utils'
import type { ZkGraphYaml } from '../types/zkgyaml'

export class DataPrep {}

export abstract class DataSourcePlugin<EP extends object, PP extends object, PRP extends object, DPP extends object> {
  abstract getLibDSPName(): string
  abstract prepareData(zkgraphYaml: ZkGraphYaml, prepareParams: PRP): Promise<DPP>
  abstract fillExecInput(input: Input, zkgraphYaml: ZkGraphYaml, dataPrep: DPP): Input
  abstract fillProveInput(input: Input, zkgraphYaml: ZkGraphYaml, dataPrep: DPP): Input
  abstract toProveDataPrep(execDataPrep: DPP, execResult: any): DPP

  abstract execParams: KeyofToArray<EP>
  toExecParams(params: Record<string, any>) {
    return dspParamsNormalize(this.execParams as string[], params) as EP
  }

  abstract proveParams: KeyofToArray<PP>
  toProveParams(params: Record<string, any>) {
    return dspParamsNormalize(this.proveParams as string[], params) as PP
  }

  toPrepareParamsFromExecParams(execParams: EP): Promise<PRP> {
    return this.toPrepareParams(execParams, 'exec')
  }

  toPrepareParamsFromProveParams(proveParams: PP): Promise<PRP> {
    return this.toPrepareParams(proveParams, 'prove')
  }

  abstract toPrepareParams(params: EP, type: 'exec'): Promise<PRP>
  abstract toPrepareParams(params: PP, type: 'prove'): Promise<PRP>
  abstract toPrepareParams(params: EP | PP, type: 'exec' | 'prove'): Promise<PRP>
}
