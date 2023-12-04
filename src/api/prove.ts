/* eslint-disable no-console */
import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import type { Nullable, NullableObjectWithKeys } from '@murongg/utils'
import { toHexStringBytes32Reverse } from '../common/utils'
import { logLoadingAnimation } from '../common/log_utils'
import { zkwasm_prove } from '../requests/zkwasm_prove'
import {
  taskPrettyPrint,
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import type { ZkGraphExecutable } from '../types/api'

/**
 * Submit prove task to a given zkwasm and return the proof details.
 * @param {object} zkGraphExecutable
 * @param {string} privateInputStr - the packed private input in hex string
 * @param {string} publicInputStr - the packed public input in hex string
 * @param {string} zkwasmProverUrl - the url of the zkwasm prover
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {object} - proof task details in json
 */
export async function prove(
  zkGraphExecutable: NullableObjectWithKeys<ZkGraphExecutable, 'zkgraphYaml'>,
  privateInputStr: string,
  publicInputStr: string,
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
  const { wasmUint8Array } = zkGraphExecutable

  // Prove mode
  const privateInputArray = privateInputStr.trim().split(' ')
  const publicInputArray = publicInputStr.trim().split(' ')

  // Message and form data
  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toUpperCase()

  result.md5 = md5

  // TODO: remove isSetUpSuccess, errorMessage, should throw errors to cli / frontend layer e.g. NoSetup & other cases.
  const [response, isSetUpSuccess, errorMessage] = await zkwasm_prove(
    zkwasmProverUrl,
    userPrivateKey,
    md5,
    publicInputArray,
    privateInputArray,
  ).catch((error) => {
    throw error
  })

  if (enableLog)
    console.log(`[*] IMAGE MD5: ${md5}`, '\n')

  // TODO: move log to cli

  if (isSetUpSuccess) {
    //   console.log(`[+] IMAGE MD5: ${response.data.result.md5}`, "\n");

    const taskId = response.data.result.id
    result.taskId = taskId
    result.errorMessage = errorMessage
    // if (enableLog) {
    //   console.log(`[+] PROVE TASK STARTED. TASK ID: ${taskId}`, "\n");

    //   console.log(
    //     "[*] Please wait for proof generation... (estimated: 1-5 min)",
    //     "\n"
    //   );
    // }
  }
  else {
    // if (enableLog) {
    //   console.log(`[-] PROVE CANNOT BE STARTED. MIGHT NEED TO SETUP`, "\n");
    // }
  }

  return result
}

export async function waitProve(
  zkwasmProverUrl: string,
  taskId: string,
  enableLog = true,
) {
  const result: {
    instances: Nullable<string>
    batch_instances: Nullable<string>
    proof: Nullable<string>
    aux: Nullable<string>
    md5: Nullable<string>
    taskId: Nullable<string>
  } = {
    instances: null,
    batch_instances: null,
    proof: null,
    aux: null,
    md5: null,
    taskId: null,
  }

  let loading

  if (enableLog)
    loading = logLoadingAnimation()

  let taskDetails
  try {
    taskDetails = await waitTaskStatus(
      zkwasmProverUrl,
      taskId,
      ['Done', 'Fail', 'DryRunFailed'],
      3000,
      0,
    ).catch((err) => {
      throw err
    }) // TODO: timeout
  }
  catch (error) {
    loading?.stopAndClear()
    throw error
  }

  if (taskDetails.status === 'Done') {
    if (enableLog) {
      loading?.stopAndClear()
      console.log('[+] PROVE SUCCESS!', '\n')
    }

    const instances = toHexStringBytes32Reverse(taskDetails.instances)
    const batch_instances = toHexStringBytes32Reverse(
      taskDetails.batch_instances,
    )
    const proof = toHexStringBytes32Reverse(taskDetails.proof)
    const aux = toHexStringBytes32Reverse(taskDetails.aux)
    if (enableLog) {
      taskPrettyPrint(taskDetails, '[*] ')

      console.log()
    }
    result.instances = instances
    result.batch_instances = batch_instances
    result.proof = proof
    result.aux = aux
    result.taskId = taskId
  }
  else {
    result.taskId = taskId

    if (enableLog) {
      loading?.stopAndClear()

      console.log('[-] PROVE OR DRYRUN FAILED.', '\n')
    }
  }

  return result
}
