import type { CLEYaml } from './zkgyaml'

export interface CLEExecutable {
  wasmUint8Array: Uint8Array
  cleYaml: CLEYaml
}

export interface ProofParams {
  aggregate_proof: Uint8Array
  batch_instances: Uint8Array
  aux: Uint8Array
  instances: Uint8Array[] // for multi proof batch
  extra?: Uint8Array
}
