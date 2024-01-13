import type FormData from 'form-data'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { handleAxiosError } from './error_handle'
import url from './url'

export async function pinata_upload(
  formData: FormData,
  pinataEndpoint: string,
  pinataJWT: string,
): Promise<[AxiosResponse<any, any>, boolean, string]> {
  let isUploadSuccess = true

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
  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage] = handleAxiosError(error)
    isUploadSuccess = false
  })

  return [response as AxiosResponse<any>, isUploadSuccess as boolean, errorMessage as string]
}
