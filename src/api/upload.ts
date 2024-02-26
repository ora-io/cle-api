import type fs from 'fs'
import FormData from 'form-data'
import { isKeyOf, objectMap } from '@murongg/utils'
import type { PinataOptions } from '../requests/pinata_upload'
import { pinata_upload } from '../requests/pinata_upload'
import { UploadFileNotExist } from '../common/error'
import { DEFAULT_PATH } from '../common/constants'

// export const UploadMustBeExistFiles = ['cle.yaml', 'cle.wasm']

export interface UploadRequiredFiles {
  yamlPath?: string
  outWasmPath?: string
}
/**
 *
 * @param {string} pinataEndpoint - The endpoint for the Pinata service.
 * @param {string} pinataJWT - The JWT token for authentication.
 * @param {string} directoryName - The name to identify the directory.
 */

export type UploadOptions = PinataOptions & UploadRequiredFiles

export interface UploadResult {
  success: boolean
  isUploadSuccess?: boolean // deprecating. == success
  errorMessage?: string
  response: any
}

/**
 * Uploads files to a specified directory.
 *
 * @param {Record<string, File | fs.ReadStream>} files - The files to be uploaded.
 * @param {UploadOptions} opitons
 * @returns {Promise<UploadResult>} - An object containing the response, upload success status, and error message (if any).
 */
export async function upload(
  files: Record<string, any>,
  options: UploadOptions,
): Promise<UploadResult> {
  const { pinataEndpoint, pinataJWT, directoryName } = options

  const {
    yamlPath = DEFAULT_PATH.YAML,
    outWasmPath = DEFAULT_PATH.OUT_WASM,
  } = options
  // check filename validity
  const UploadMustBeExistFiles = [yamlPath, outWasmPath]
  UploadMustBeExistFiles.forEach((filename) => {
    if (!isKeyOf(files, filename))
      throw new UploadFileNotExist(`File ${filename} does not exist.`)
  })

  // setup form data
  // const directoryName = `${directoryTag.graphName}-${directoryTag.userAddress}`
  const formData = new FormData()
  objectMap(files, (key: string, value: File | fs.ReadStream) => {
    formData.append('file', value, __BROWSER__
      ? `${directoryName}/${key}`
      : {
          filepath: `${directoryName}/${key}`,
        })
    return undefined
  })
  const metadata = JSON.stringify({
    name: directoryName,
  })
  formData.append('pinataMetadata', metadata)
  // upload
  const pinataresult = await pinata_upload(
    formData,
    pinataEndpoint,
    pinataJWT,
  ).catch((error) => {
    throw error
  })

  return pinataresult
}
