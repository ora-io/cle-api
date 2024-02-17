import type { AxiosResponse } from 'axios'
import axios from 'axios'
import type { Signer } from 'ethers'
import { InputContextType, ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { Input } from 'zkwasm-toolchain'
import type { SingableProver } from '../api/setup'
import { DEFAULT_URL } from '../common/constants'
import url from './url'
import { handleAxiosError } from './error_handle'

/**
 * send prove request to ora prover with user_privatekey, should be compatible to zkwasmhub
 */
export async function ora_prove(
  image_md5: string,
  input: Input,
  options: SingableProver,
): Promise<[AxiosResponse<any, any>, boolean, string]> {
  const { proverUrl = DEFAULT_URL.PROVER, signer } = options

  let isSetUpSuccess = true

  const user_address = (await signer.getAddress()).toLowerCase()

  const privateInputArray = input.getPrivateInputStr().trim().split(' ')
  const publicInputArray = input.getPublicInputStr().trim().split(' ')

  const signature = await signMessage(signer, image_md5, publicInputArray, privateInputArray)
  const formData = assembleFormData(user_address, image_md5, publicInputArray, privateInputArray)

  formData.append('aux_params', JSON.stringify(input.auxParams))

  const zkwasmHeaders = {
    'X-Eth-Signature': signature,
    'Content-Type': 'multipart/form-data',
  }

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url.proveWasmImageURL(proverUrl).url,
    headers: {
      ...zkwasmHeaders,
    },
    data: formData,
  }

  let errorMessage = ''

  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage] = handleAxiosError(error)
    isSetUpSuccess = false
  })

  // console.log('response:', response)
  return [response as AxiosResponse<any>, isSetUpSuccess as boolean, errorMessage as string]
}

/**
 * assemble formData for zkwasmhub compatibility
 */
function assembleFormData(
  user_address: string,
  image_md5: string,
  public_inputs: string[],
  private_inputs: string[],
) {
  const formData = new FormData()
  formData.append('user_address', user_address.toLowerCase())
  formData.append('md5', image_md5)
  for (let i = 0; i < public_inputs.length; i++)
    formData.append('public_inputs', public_inputs[i])

  for (let i = 0; i < private_inputs.length; i++)
    formData.append('private_inputs', private_inputs[i])

  formData.append('input_context_type', InputContextType.ImageCurrent)
  return formData
}

/**
 * sign message for zkwasmhub compatibility
 */
async function signMessage(
  signer: Signer,
  image_md5: string,
  public_inputs: string[],
  private_inputs: string[],
) {
  const user_address = (await signer.getAddress()).toLowerCase()

  const message = ZkWasmUtil.createProvingSignMessage({
    user_address: user_address.toLowerCase(),
    md5: image_md5.toUpperCase(),
    public_inputs,
    private_inputs,
    input_context_type: InputContextType.ImageCurrent,
  })

  const signature = await signer.signMessage(message)
  return signature
}
