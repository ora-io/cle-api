import type FormData from 'form-data'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { isFunction } from '@murongg/utils'
import type { UploadResult } from '../api/upload'
import { handleAxiosError } from './error_handle'
import url from './url'

export interface PinitaUploadResult extends UploadResult {
  response: AxiosResponse<any, any> | void
}

export async function pinata_upload(
  formData: FormData,
  pinataEndpoint: string,
  pinataJWT: string,
): Promise<PinitaUploadResult> {
  let isUploadSuccess = true
  const headers = formData && isFunction(formData.getHeaders) ? formData.getHeaders() : {}

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url.uploadToPinata(pinataEndpoint).url,
    headers: {
      Authorization: `Bearer ${pinataJWT}`,
      ...headers,
    },
    data: formData,
  }

  let errorMessage = ''
  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage] = handleAxiosError(error)
    isUploadSuccess = false
  })

  return {
    response,
    success: isUploadSuccess,
    isUploadSuccess, // deprecating
    errorMessage,
  }
}
