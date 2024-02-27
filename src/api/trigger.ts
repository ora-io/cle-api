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
  for (let i = 0; i < ddpParamsList.length; i++)
    await ddps[i].go(cleId, proofParams, ddpParamsList[i])
}
