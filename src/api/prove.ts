import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import type { Nullable } from '@murongg/utils'
import { toHexStringBytes32Reverse } from '../common/utils'
import { ora_prove_sk } from '../requests/zkwasm_prove'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import type { CLEExecutable } from '../types/api'
import type { Input } from '../common'

/**
 * Submit prove task to a given zkwasm and return the proof details.
 * @param {object} cleExecutable
 * @param {string} privateInputStr - the packed private input in hex string
 * @param {string} publicInputStr - the packed public input in hex string
 * @param {string} zkwasmProverUrl - the url of the zkwasm prover
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {object} - proof task details in json
 */
export async function prove(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  input: Input,
  zkwasmProverUrl: string,
  userPrivateKey: string,
  enableLog = true,
) {
  const result: {
    md5: Nullable<string>
    taskId: Nullable<string>
    errorMessage: Nullable<string>
  } = {
    md5: null,
    taskId: null,
    errorMessage: null,
  }
  const { wasmUint8Array } = cleExecutable

  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toUpperCase()

  result.md5 = md5

  // TODO: remove isSetUpSuccess, errorMessage, should throw errors to cli / frontend layer e.g. NoSetup & other cases.
  const [response, isSetUpSuccess, errorMessage] = await ora_prove_sk(
    zkwasmProverUrl,
    userPrivateKey,
    md5,
    input,
  ).catch((error) => {
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

  if (enableLog)
    console.log(`[*] IMAGE MD5: ${md5}`, '\n')

  if (isSetUpSuccess) {
    const taskId = response.data.result.id
    result.taskId = taskId
    result.errorMessage = errorMessage
  }
  return result
}

export async function waitProve(
  zkwasmProverUrl: string,
  taskId: string,
) {
  const result: {
    instances: Nullable<string>
    batch_instances: Nullable<string>
    proof: Nullable<string>
    aux: Nullable<string>
    md5: Nullable<string>
    taskId: Nullable<string>
    status: Nullable<string>
    taskDetails: Nullable<any>
  } = {
    instances: null,
    batch_instances: null,
    proof: null,
    aux: null,
    md5: null,
    taskId: null,
    status: '',
    taskDetails: null,
  }

  const taskDetails = await waitTaskStatus(
    zkwasmProverUrl,
    taskId,
    ['Done', 'Fail', 'DryRunFailed'],
    3000,
    0,
  ).catch((err) => {
    throw err
  }) // TODO: timeout

  if (taskDetails.status === 'Done') {
    const instances = toHexStringBytes32Reverse(taskDetails.instances)
    const batch_instances = toHexStringBytes32Reverse(
      taskDetails.batch_instances,
    )
    const proof = toHexStringBytes32Reverse(taskDetails.proof)
    const aux = toHexStringBytes32Reverse(taskDetails.aux)
    result.instances = instances
    result.batch_instances = batch_instances
    result.proof = proof
    result.aux = aux
    result.taskId = taskId
    result.status = taskDetails.status
  }
  else {
    result.taskId = taskId
  }

  result.taskDetails = taskDetails
  return result
}
