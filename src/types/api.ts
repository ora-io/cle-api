import type { CLEYaml } from './zkgyaml'

export interface ZkGraphExecutable {
  wasmUint8Array: Uint8Array
  cleYaml: CLEYaml
}
