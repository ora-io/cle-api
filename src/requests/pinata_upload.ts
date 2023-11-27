import FormData from 'form-data'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import { handleAxiosError } from './error_handle'
import url from './url'

export async function pinata_upload(
  // userAddress,
  wasmPath: string,
  mappingPath: string,
  yamlPath: string,
  // zkGraphName,
  pinataEndpoint: string,
  pinataJWT: string,
) {
  let isUploadSuccess = true

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs')

  // TODO: upload src/ rather than mapping only
  const mappingFile = fs.createReadStream(mappingPath)
  const wasmFile = fs.createReadStream(wasmPath)
  const yamlFile = fs.createReadStream(yamlPath)

  const wasmU8A = new Uint8Array(fs.readFileSync(wasmPath))
  const yamlU8A = new Uint8Array(fs.readFileSync(yamlPath))

  const mergedArray = new Uint8Array(wasmU8A.length + yamlU8A.length)
  mergedArray.set(wasmU8A)
  mergedArray.set(yamlU8A, wasmU8A.length)
  const md5_merged = ZkWasmUtil.convertToMd5(mergedArray).toUpperCase()

  const directoryName = `zkgraph-md5-${md5_merged}`

  const formData = new FormData()
  formData.append('file', mappingFile, {
    filepath: `${directoryName}/mapping.ts`,
  })
  formData.append('file', wasmFile, {
    filepath: `${directoryName}/zkgraph.wasm`,
  })
  formData.append('file', yamlFile, {
    filepath: `${directoryName}/zkgraph.yaml`,
  })

  const metadata = JSON.stringify({
    name: directoryName,
  })
  formData.append('pinataMetadata', metadata)

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url.uploadToPinata(pinataEndpoint).url,
    headers: {
      Authorization: `Bearer ${pinataJWT}`,
      ...formData.getHeaders(),
    },
    data: formData,
  }

  let errorMessage = ''
  // NODE: fix this, useless var
  // let _
  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage] = handleAxiosError(error)
    isUploadSuccess = false
  })

  return [response as AxiosResponse<any>, isUploadSuccess as boolean, errorMessage as string]
}
