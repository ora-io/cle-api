import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { Nullable } from '@murongg/utils'
import type { Input } from 'zkwasm-toolchain'
import { ora_prove } from '../requests/ora_prove'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import type { CLEExecutable, ProofParams } from '../types/api'
import { logger } from '../common'
import { FinishStatusList } from '../common/constants'
import { type BatchOption, BatchStyle, type SingableProver } from './setup'

export type ProveOptions = SingableProver
/**
 * Submit prove task to a given zkwasm and return the proof details.
 * @param {object} cleExecutable
 * @param {Input} input
 * @param {string} options
 * @returns {object} - proof task details in json
 */
export async function prove(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  input: Input,
  options: ProveOptions,
) {
  const result: {
    md5: Nullable<string>
    taskId: Nullable<string>
  } = {
    md5: null,
    taskId: null,
  }
  const { wasmUint8Array } = cleExecutable

  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toUpperCase()

  result.md5 = md5

  await ora_prove(
    md5,
    input,
    options,
  ).then(async (response) => {
    result.taskId = response.data.result.id
    logger.log(`[+] PROVING TASK STARTED. TASK ID: ${result.taskId}`, '\n')
  })
    .catch((error) => {
    // TODO: other error types need to be handle here? e.g. NoSetup
      throw error
    })

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

  logger?.log(`[*] IMAGE MD5: ${md5}`, '\n')
  return result
}

export async function waitProve(
  proverUrl: string,
  proveTaskId: string,
  options: BatchOption = {},
) {
  const { batchStyle = BatchStyle.ZKWASMHUB } = options
  const task = await waitTaskStatus(proverUrl, proveTaskId, FinishStatusList, 3000, 0)
  // .catch((err) => {
  //   throw err
  // }) // TODO: timeout

  const result: {
    status: Nullable<string>
    proofParams: Nullable<ProofParams>
    taskDetails: Nullable<any> // optional
  } = {
    status: task.status,
    proofParams: null,
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
