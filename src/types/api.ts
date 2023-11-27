import type { ZkGraphYaml } from './zkgyaml'

export interface ZkGraphExecutable {
  wasmUint8Array: Uint8Array
  zkgraphYaml: ZkGraphYaml
}
