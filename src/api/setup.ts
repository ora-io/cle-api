/* eslint-disable no-console */
import type fs from 'fs'
import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import type { NullableObjectWithKeys } from '@murongg/utils'
import { zkwasm_setup } from '../requests/zkwasm_setup'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { ImageAlreadyExists } from '../common/error'
import { zkwasm_imagetask } from '../requests/zkwasm_imagetask'
import type { ZkGraphExecutable } from '../types/api'

/**
 * Set up zkwasm image with given wasm file.
 * @param {string} wasmName
 * @param {string} wasmUint8Array
 * @param {number} circuitSize
 * @param {string} userPrivateKey
 * @param {string} ZkwasmProviderUrl
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {{string, string, boolean}} - {'md5': md5, 'taskId': taskId, 'success': success}
 */
export async function setup(
  wasmName: string,
  zkGraphExecutable: NullableObjectWithKeys<ZkGraphExecutable, 'zkgraphYaml'> & { image: File | fs.ReadStream },
  circuitSize: number,
  userPrivateKey: string,
  ZkwasmProviderUrl: string,
  isLocal = false,
  enableLog = true,
) {
  const { wasmUint8Array, image } = zkGraphExecutable
  let cirSz
  if (circuitSize >= 18 && circuitSize <= 30) {
    cirSz = circuitSize
  }
  else {
    // if too ridiculous, set to default
    cirSz = isLocal ? 20 : 22
    if (enableLog) {
      console.warn(
        '[-] Warning: circuit size [',
        cirSz,
        '] was impractical, reset to default:',
        cirSz,
      )
    }
  }

  if (!wasmUint8Array)
    throw new Error('wasmUint8Array is not defined')

  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toLowerCase()
  const description_url_encoded = ''
  const avator_url = ''
  const circuit_size = cirSz

  if (enableLog)
    console.log(`[+] IMAGE MD5: ${md5}`, '\n')

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let taskDetails
  let taskId
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let setupStatus

  await zkwasm_setup(
    ZkwasmProviderUrl,
    wasmName, // only use in zkwasm, can diff from local files
    md5,
    image,
    userPrivateKey,
    description_url_encoded,
    avator_url,
    circuit_size,
  )
    .then(async (response) => {
      // console.log(response.data)
      taskId = response.data.result.id

      if (enableLog)
        console.log(`[+] SET UP TASK STARTED. TASK ID: ${taskId}`, '\n')
    })
    .catch(async (error) => {
      // return the last status if exists
      if (error instanceof ImageAlreadyExists) {
        // check if there's any "Reset" task before
        let res = await zkwasm_imagetask(ZkwasmProviderUrl, md5, 'Reset')
        // if no "Reset", check "Setup"
        if (res.data.result.total === 0)
          res = await zkwasm_imagetask(ZkwasmProviderUrl, md5, 'Setup')

        taskDetails = res.data.result.data[0]
        taskId = res.data.result.data[0]._id.$oid
        setupStatus = res.data.result.data[0].status

        if (enableLog) {
          console.log(
            `[*] IMAGE ALREADY EXISTS. PREVIOUS SETUP TASK ID: ${taskId}`,
            '\n',
          )
        }
      }
      else {
        throw error
      }
    })
}

export async function waitSetup(ZkwasmProviderUrl: string, taskId: string, _enableLog: boolean) {
  const result: { taskId: string | null; success: boolean; taskDetails: any } = { taskId: null, success: false, taskDetails: null }

  const taskDetails = await waitTaskStatus(
    ZkwasmProviderUrl,
    taskId,
    ['Done', 'Fail'],
    3000,
    0,
  ) // TODO: timeout
  const setupStatus = taskDetails.status

  result.success = setupStatus === 'Done'
  result.taskId = taskId
  result.taskDetails = taskDetails
  return result
}
