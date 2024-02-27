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
  if (ddpParamsList.length !== ddps.length)
    throw new Error(`The length of DDP params list provided (${ddpParamsList.length}) doesn't match yaml specified DDP numbers ${ddps.length} `)

  for (let i = 0; i < ddps.length; i++)
    await ddps[i].go(cleId, proofParams, ddpParamsList[i])
}
