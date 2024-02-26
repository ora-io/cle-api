// TODO rename to api/interface.ts
import type { Signer } from 'ethers'
import type { CLEYaml } from './zkgyaml'

export interface CLEExecutable {
  wasmUint8Array: Uint8Array
  cleYaml: CLEYaml
}

export interface ProofParams {
  aggregate_proof: Uint8Array
  batch_instances: Uint8Array
  aux: Uint8Array
  instances: Uint8Array[]
  extra?: Uint8Array
}

export enum BatchStyle {
  ORA,
  ZKWASMHUB,
}
export interface BatchOption {
  batchStyle?: BatchStyle
}

export interface SingableProver {
  proverUrl: string
  signer: Signer
}
