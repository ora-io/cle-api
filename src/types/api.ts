// TODO rename to api/interface.ts
// Only define common interface here to reduce possible conflicts
import type { Signer } from 'ethers'
import type { CLEYaml } from '../yaml'

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
  ORA_SINGLE,
  ZKWASMHUB,
}
export interface BatchOption {
  batchStyle?: BatchStyle
}

export interface SingableProver {
  proverUrl: string
  signer: Signer
}
