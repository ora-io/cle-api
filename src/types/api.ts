import type { CLEYaml } from './zkgyaml'

export interface CLEExecutable {
  wasmUint8Array: Uint8Array
  cleYaml: CLEYaml
}
