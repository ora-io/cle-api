import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { Signer } from 'ethers'
import type { Nullable } from '@murongg/utils/index'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { CircuitSizeOutOfRange, ImageAlreadyExists } from '../common/error'
import { zkwasm_imagetask } from '../requests/zkwasm_imagetask'
import type { CLEExecutable } from '../types/api'
import { ora_setup } from '../requests'
import { createFileStream } from '../common/compatible'
import { DEFAULT_CIRCUIT_SIZE, DEFAULT_URL, MAX_CIRCUIT_SIZE, MIN_CIRCUIT_SIZE } from '../common/constants'
import { logger } from '../common'

export interface SingableProver {
  proverUrl: string
  signer: Signer
}
export interface BasicSetupParams {
  circuitSize?: number
  imageName?: string // only use in zkwasm, can diff from local files
  descriptionUrl?: string
  avatorUrl?: string
}

export type SetupOptions = SingableProver & BasicSetupParams & { enableLog?: boolean }
/**
 * Set up zkwasm image with given wasm file.
 */
export async function setup(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  options: SetupOptions,
) {
  const result: {
    md5: Nullable<string>
    taskId: Nullable<string>
  } = {
    md5: null,
    taskId: null,
  }

  const { wasmUint8Array } = cleExecutable
  const {
    circuitSize = DEFAULT_CIRCUIT_SIZE, enableLog = true,
    proverUrl = DEFAULT_URL.PROVER,
  } = options
  const image = createFileStream(wasmUint8Array, { fileType: 'application/wasm', fileName: 'cle.wasm' })

  if (circuitSize < MIN_CIRCUIT_SIZE || circuitSize > MAX_CIRCUIT_SIZE)
    throw new CircuitSizeOutOfRange('Circuit size out of range. Please set it between 18 and 24.')

  // if (!wasmUint8Array)
  //   throw new Error('wasmUint8Array is not defined')

  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toLowerCase()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let taskDetails
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let setupStatus

  await ora_setup(
    md5,
    image,
    options,
  )
    .then(async (response) => {
      // console.log(response.data)
      result.taskId = response.data.result.id
      // result.status = response.data.result.data[0].status

      if (enableLog)
        logger.log(`[+] SET UP TASK STARTED. TASK ID: ${result.taskId}`, '\n')
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
        result.taskId = res.data.result.data[0]._id.$oid
        setupStatus = res.data.result.data[0].status

        if (enableLog) {
          logger.log(
            `[*] IMAGE ALREADY EXISTS. PREVIOUS SETUP TASK ID: ${result.taskId}`,
            '\n',
          )
        }
      }
      else {
        throw error
      }
    })
  return result
}

export async function waitSetup(ProverProviderUrl: string, taskId: string) {
  const result: { taskId: string | null; success: boolean; taskDetails: any } = { taskId: null, success: false, taskDetails: null }

  const taskDetails = await waitTaskStatus(
    ProverProviderUrl,
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
