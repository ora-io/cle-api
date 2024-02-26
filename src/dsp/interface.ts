// - prepare data from yaml
// - fill input
// - prep structure

import type { KeyofToArray } from '@murongg/utils'
import type { Input } from 'zkwasm-toolchain'
import { paramsNormalize } from '../common/utils'
import type { CLEYaml } from '../types/zkgyaml'

export class DataPrep {
  expectedStateStr: any
  constructor(expectedStateStr: string) {
    this.expectedStateStr = expectedStateStr
  }
}

export abstract class DataSourcePlugin<EP extends object, PP extends object, PRP extends object, DP extends object> {
  abstract getLibDSPName(): string
  abstract prepareData(cleYaml: CLEYaml, prepareParams: PRP): Promise<DP>
  abstract fillExecInput(input: Input, cleYaml: CLEYaml, dataPrep: DP): Input
  abstract fillProveInput(input: Input, cleYaml: CLEYaml, dataPrep: DP): Input
  abstract toProveDataPrep(execDataPrep: DP, execResult: any): DP

  abstract execParams: KeyofToArray<EP>
  toExecParams(params: Record<string, any>) {
    return paramsNormalize(this.execParams as string[], params) as EP
  }

  abstract proveParams: KeyofToArray<PP>
  toProveParams(params: Record<string, any>) {
    return paramsNormalize(this.proveParams as string[], params) as PP
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
