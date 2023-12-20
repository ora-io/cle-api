import type fs from 'fs'
import FormData from 'form-data'
import { isKeyOf, objectMap } from '@murongg/utils'
import { pinata_upload } from '../requests/pinata_upload'
import { UploadFileNotExist } from '../common/error'

export const UploadMustBeExistFiles = ['zkgraph.yaml', 'zkgraph.wasm']

/**
 * Uploads files to a specified directory.
 *
 * @param {Record<string, File | fs.ReadStream>} files - The files to be uploaded.
 * @param {{ graphName: string, userAddress: string }} directoryTag - The tag to identify the directory.
 * @param {string} pinataEndpoint - The endpoint for the Pinata service.
 * @param {string} pinataJWT - The JWT token for authentication.
 * @returns {Promise<{ response: any, isUploadSuccess: boolean, errorMessage: string }>} - An object containing the response, upload success status, and error message (if any).
 */
export async function upload(
  files: Record<string, File | fs.ReadStream>,
  directoryTag: {
    graphName: string
    userAddress: string
  },
  pinataEndpoint: string,
  pinataJWT: string,
) {
  // check filename validity
  UploadMustBeExistFiles.forEach((filename) => {
    if (!isKeyOf(files, filename))
      throw new UploadFileNotExist(`File ${filename} does not exist.`)
  })

  // setup form data
  const directoryName = `${directoryTag.graphName}-${directoryTag.userAddress}`
  const formData = new FormData()
  objectMap(files, (key: string, value: File | fs.ReadStream) => {
    formData.append('file', value, {
      filepath: `${directoryName}/src/${key}`,
    })
    return undefined
  })
  const metadata = JSON.stringify({
    name: directoryName,
  })
  formData.append('pinataMetadata', metadata)
  // upload
  const [response, isUploadSuccess, errorMessage] = await pinata_upload(
    formData,
    pinataEndpoint,
    pinataJWT,
  ).catch((error) => {
    throw error
  })

  return {
    response,
    isUploadSuccess,
    errorMessage,
  }
}
