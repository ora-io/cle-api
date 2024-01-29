import { ddpHub } from '../ddp/hub'
import type { CLEExecutable, ProofParams } from '../types'

export async function trigger(
  cleExecutable: Omit<CLEExecutable, 'wasmUint8Array'>,
  cleId: string,
  proofParams: ProofParams,
  ddpParamsList: Record<string, any>[], // 1 ddpParams per ddp
  _enableLog = false,
) {
  const { cleYaml } = cleExecutable
  const ddps = ddpHub.getDDPsByYaml(cleYaml)
  ddps.forEach((ddp) => {
    ddp.go(cleId, proofParams, ddpParamsList).catch((err) => { throw err })
  })
}
