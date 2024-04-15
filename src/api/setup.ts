import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { CircuitSizeOutOfRange, ImageAlreadyExists, ImageInvalid, ImageNotExists } from '../common/error'
import { zkwasm_imagetask } from '../requests/zkwasm_imagetask'
import type { CLEExecutable, SingableProver } from '../types'
import { ora_setup, zkwasm_imagedetails } from '../requests'
import { createFileStream } from '../common/compatible'
import { DEFAULT_CIRCUIT_SIZE, DEFAULT_URL, MAX_CIRCUIT_SIZE, MIN_CIRCUIT_SIZE, PROVER_RPC_CONSTANTS } from '../common/constants'
import { logger } from '../common'

export interface BasicSetupParams {
  circuitSize?: number
  imageName?: string // optional, can diff from local files
  descriptionUrl?: string
  avatorUrl?: string
}

export type SetupOptions = SingableProver & BasicSetupParams

export interface SetupResult {
  status: string
  success: boolean
  taskDetails?: any // optional
}

export async function setup(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  options: SetupOptions,
): Promise<SetupResult> {
  const rsResult = await requestSetup(cleExecutable, options)
  const wsResult = await waitSetup(options.proverUrl, rsResult.taskId)
  return wsResult
}

export interface RequestSetupResult {
  md5: string
  taskId: string
  taskDetails?: any // optional
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
        let res = await zkwasm_imagetask(proverUrl, md5, PROVER_RPC_CONSTANTS.TASK_TYPE_RESET)
        // if no "Reset", check "Setup"
        if (res.data.result.total === 0)
          res = await zkwasm_imagetask(proverUrl, md5, PROVER_RPC_CONSTANTS.TASK_TYPE_SETUP)

        taskDetails = res.data.result.data[0]
        taskId = res.data.result.data[0]._id.$oid
        // setupStatus = res.data.result.data[0].status

        logger.log(`[*] IMAGE ALREADY EXISTS. PREVIOUS SETUP TASK ID: ${taskId}`, '\n')
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
    PROVER_RPC_CONSTANTS.TASK_STATUS_SETUP_FINISH_LIST,
    3000,
    0,
  ) // TODO: timeout

  const result: SetupResult = {
    success: taskDetails.status === PROVER_RPC_CONSTANTS.TASK_STATUS_DONE,
    status: taskDetails.status,
    taskDetails,
  }
  return result
}

export async function requireImageDetails(proverUrl: string, md5: string) {
  const response = await zkwasm_imagedetails(proverUrl, md5)
  const details = response[0]?.data.result[0]
  if (details === null)
    throw new ImageNotExists('Can\'t find wasm image in prover, please finish setup first.')
  if (details.status !== PROVER_RPC_CONSTANTS.IMAGE_STATUS_VALID && details.status !== PROVER_RPC_CONSTANTS.IMAGE_STATUS_INITIALIZED)
    throw new ImageInvalid('wasm image is invalid in prover, please setup a valid wasm. or contact admin if you believe it should be valid.')

  return details
}
