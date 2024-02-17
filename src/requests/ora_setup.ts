import FormData from 'form-data'
import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import { ImageAlreadyExists, PaymentError } from '../common/error'
import type { SetupOptions } from '../api/setup'
import { DEFAULT_CIRCUIT_SIZE, DEFAULT_URL } from '../common/constants'
import { logger } from '../common'
import { handleAxiosError } from './error_handle'
import url from './url'

export async function ora_setup(
  image_md5: string,
  image: any,
  options: SetupOptions,
) {
  const {
    proverUrl = DEFAULT_URL.PROVER, signer,
    circuitSize: circuit_size = DEFAULT_CIRCUIT_SIZE,
    imageName: name = 'cle.wasm', descriptionUrl: description_url = '', avatorUrl: avator_url = '',
  } = options
  const user_address = (await signer.getAddress()).toLowerCase()

  // Create Signning Message
  const message = ZkWasmUtil.createAddImageSignMessage({
    name,
    image_md5: image_md5.toLowerCase(),
    image,
    user_address,
    description_url,
    avator_url,
    circuit_size,
  })

  const signature = await signer.signMessage(message)

  // Assemble FormData
  const formData = new FormData()
  formData.append('name', name)
  formData.append('image_md5', image_md5.toLowerCase())
  formData.append('image', image)
  formData.append('user_address', user_address)
  formData.append('description_url', description_url)
  formData.append('avator_url', avator_url)
  formData.append('circuit_size', circuit_size)
  // formData.append("signature", signature);

  const zkwasmHeaders = {
    'X-Eth-Address': user_address,
    'X-Eth-Signature': signature,
  }

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url.postNewWasmImage(proverUrl).url,
    headers: {
      ...formData.getHeaders(),
      ...zkwasmHeaders,
    },
    data: formData,
  }

  let response

  let errorMessage = ''
  let isRetry
  // TODO: should change to setTimeInterval.
  const retry_time = 1
  for (let i = 0; i < retry_time + 1; i++) {
    response = await axios.request(requestConfig).catch((error) => {
      [errorMessage, isRetry] = handleAxiosError(error)
      if (isRetry) {
        // pass
      }
      else if (errorMessage === 'Error: Image already exists!') {
        throw new ImageAlreadyExists(errorMessage)
      }
      else if (errorMessage.startsWith('Payment error')) {
        throw new PaymentError(errorMessage)
      }
      else {
        // console.error("Error in zkwasm_setup. Please retry.");
        // throw error;
        logger.log(error.message)
      }
      // errorMessage = error.response.data;
    })
    if (!isRetry)
      break

    // for debug purpose, can delete after stable.
    logger.log(errorMessage, 'retrying..')
  }
  return response as AxiosResponse<any>
}
