import { ddpHub } from '../ddp/hub'
import type { CLEExecutable, ProofParams } from '../types'

/**
 * @dev experimental, only used for Ora Node, Non-public use, only works in Ora Batch Style
 */
export async function trigger(
  cleExecutable: Omit<CLEExecutable, 'wasmUint8Array'>,
  cleId: string,
  proofParams: ProofParams,
  ddpParamsList: Record<string, any>[], // 1 ddpParams per ddp
): Promise<void> {
  const { cleYaml } = cleExecutable
  const ddps = ddpHub.getDDPsByYaml(cleYaml)
  for (const ddp of ddps)
    await ddp.go(cleId, proofParams, ddpParamsList)
}
