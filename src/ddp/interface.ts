import type { KeyofToArray } from '@murongg/utils/index'
import type { ProofParams } from '../types'
import { dspParamsNormalize } from '../common/utils'

export abstract class DataDestinationPlugin<GP extends object> {
  abstract goParams: KeyofToArray<GP>
  toGoParams(params: Record<string, any>) {
    return dspParamsNormalize(this.goParams as string[], params) as GP
  }
  abstract go(cleId: string, proofParams: ProofParams, goParams: GP): Promise<void >
}
