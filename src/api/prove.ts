import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { Input } from 'zkwasm-toolchain'
import { ora_prove } from '../requests/ora_prove'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import type { BatchOption, CLEExecutable, ProofParams, SingableProver } from '../types'
import { BatchStyle } from '../types'
import { logger } from '../common'
import { FinishStatusList } from '../common/constants'

export type ProveOptions = SingableProver & BatchOption

export interface ProveResult {
  status: string
  proofParams?: ProofParams
  taskDetails?: any // optional
}

/**
 * Submit prove task to a given zkwasm and return the proof details.
 */
export async function prove(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  input: Input,
  options: ProveOptions,
): Promise<ProveResult> {
  const prResult = await requestProve(cleExecutable, input, options)
  const pwResult = await waitProve(options.proverUrl, prResult.taskId, options)
  return pwResult
}

export interface RequestProveResult {
  md5: string
  taskId: string
  taskDetails?: any // optional
}

export async function requestProve(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  input: Input,
  options: ProveOptions,
): Promise<RequestProveResult> {
  const { wasmUint8Array } = cleExecutable

  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toUpperCase()
  logger.log(`[*] IMAGE MD5: ${md5}`, '\n')

  let taskDetails
  let taskId = '' // taskId must be set to response.data.result.id later
  await ora_prove(md5, input, options)
    .then(async (response) => {
      taskId = response.data.result.id
      taskDetails = response.data.result.data[0]
      logger.log(`[+] PROVING TASK STARTED. TASK ID: ${taskId}`, '\n')
    })
    // TODO: other error types need to be catch here? e.g. NoSetup

  const result: RequestProveResult = { md5, taskId, taskDetails }
  return result
  // const privateInputArray = input.getPrivateInputStr().trim().split(' ')
  // const publicInputArray = input.getPublicInputStr().trim().split(' ')
  // const [response, isSetUpSuccess, errorMessage] = await zkwasm_prove(
  //   zkwasmProverUrl,
  //   userPrivateKey,
  //   md5,
  //   publicInputArray,
  //   privateInputArray,
  // ).catch((error) => {
  //   throw error
  // })
}

export async function waitProve(
  proverUrl: string,
  proveTaskId: string,
  options: BatchOption = {},
): Promise<ProveResult> {
  const { batchStyle = BatchStyle.ZKWASMHUB } = options
  const task = await waitTaskStatus(proverUrl, proveTaskId, FinishStatusList, 3000, 0)
  // .catch((err) => {
  //   throw err
  // }) // TODO: timeout

  const result: ProveResult = {
    status: task.status,
    proofParams: undefined,
    taskDetails: task,
  }

  if (task.status === 'Done') {
    const proofParams: ProofParams = {
      aggregate_proof: task.proof,
      batch_instances: task.batch_instances,
      aux: task.aux,
      // 2-dim, ZKWASMHUB-compatible
      instances: batchStyle === BatchStyle.ZKWASMHUB ? [task.instances] : task.instances,
      extra: task?.extra,
    }
    result.proofParams = proofParams
  }

  return result
}
