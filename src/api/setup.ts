import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { Signer } from 'ethers'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { CircuitSizeOutOfRange, ImageAlreadyExists } from '../common/error'
import { zkwasm_imagetask } from '../requests/zkwasm_imagetask'
import type { CLEExecutable, RequestSetupResult, SetupResult } from '../types/api'
import { ora_setup } from '../requests'
import { createFileStream } from '../common/compatible'
import { DEFAULT_CIRCUIT_SIZE, DEFAULT_URL, MAX_CIRCUIT_SIZE, MIN_CIRCUIT_SIZE } from '../common/constants'
import { logger } from '../common'

export enum BatchStyle {
  ORA,
  ZKWASMHUB,
}

export interface BatchOption {
  batchStyle?: BatchStyle
}
export interface SingableProver {
  proverUrl: string
  signer: Signer
}
export interface BasicSetupParams {
  circuitSize?: number
  imageName?: string // optional, can diff from local files
  descriptionUrl?: string
  avatorUrl?: string
}

export type SetupOptions = SingableProver & BasicSetupParams

export async function setup(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  options: SetupOptions,
): Promise<SetupResult> {
  const rsResult = await requestSetup(cleExecutable, options)
  const wsResult = await waitSetup(options.proverUrl, rsResult.taskId)
  return wsResult
}

/**
 * Set up zkwasm image with given wasm file.
 */
export async function requestSetup(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  options: SetupOptions,
): Promise<RequestSetupResult> {
  const { wasmUint8Array } = cleExecutable
  const {
    circuitSize = DEFAULT_CIRCUIT_SIZE,
    proverUrl = DEFAULT_URL.PROVER,
  } = options
  const image = createFileStream(wasmUint8Array, { fileType: 'application/wasm', fileName: 'cle.wasm' })

  if (circuitSize < MIN_CIRCUIT_SIZE || circuitSize > MAX_CIRCUIT_SIZE)
    throw new CircuitSizeOutOfRange('Circuit size out of range. Please set it between 18 and 24.')

  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toLowerCase()

  let taskDetails
  let taskId = ''
  // let setupStatus

  await ora_setup(
    md5,
    image,
    options,
  )
    .then(async (response) => {
      taskId = response.data.result.id
      taskDetails = response.data.result.data[0]
      // result.status = response.data.result.data[0].status

      logger.log(`[+] SET UP TASK STARTED. TASK ID: ${taskId}`, '\n')
    })
    .catch(async (error) => {
      // return the last status if exists
      if (error instanceof ImageAlreadyExists) {
        // check if there's any "Reset" task before
        let res = await zkwasm_imagetask(proverUrl, md5, 'Reset')
        // if no "Reset", check "Setup"
        if (res.data.result.total === 0)
          res = await zkwasm_imagetask(proverUrl, md5, 'Setup')

        taskDetails = res.data.result.data[0]
        taskId = res.data.result.data[0]._id.$oid
        // setupStatus = res.data.result.data[0].status
        
        logger.log(`[*] IMAGE ALREADY EXISTS. PREVIOUS SETUP TASK ID: ${taskId}`,'\n')
      }
      else {
        throw error
      }
    })

  const result: RequestSetupResult = {
    md5,
    taskId,
    taskDetails,
  }
  return result
}

export async function waitSetup(proverUrl: string, taskId: string): Promise<SetupResult> {
  const taskDetails = await waitTaskStatus(
    proverUrl,
    taskId,
    ['Done', 'Fail'],
    3000,
    0,
  ) // TODO: timeout

  const result: SetupResult = {
    success: taskDetails.status === 'Done',
    status: taskDetails.status,
    taskDetails,
  }
  return result
}
