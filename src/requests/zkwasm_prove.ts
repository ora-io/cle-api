import type { AxiosResponse } from 'axios'
import axios from 'axios'
import FormData from 'form-data'
import { Wallet, utils } from 'ethers'
import { InputContextType, ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import { handleAxiosError } from './error_handle'
import url from './url'
// import { sign } from "crypto";

/**
 * send prove request to zkwasmhub
 */
export async function zkwasm_prove(
  zkwasmProverUrl: string,
  user_privatekey: string,
  image_md5: string,
  public_inputs: string[],
  private_inputs: string[],
): Promise<[AxiosResponse<any, any>, boolean, string]> {
  let isSetUpSuccess = true

  const user_address = utils.computeAddress(user_privatekey).toLowerCase()

  const message = ZkWasmUtil.createProvingSignMessage({
    user_address: user_address.toLowerCase(),
    md5: image_md5.toUpperCase(),
    public_inputs,
    private_inputs,
    input_context_type: InputContextType.ImageCurrent,
  })

  const wallet = new Wallet(user_privatekey)
  const signature = await wallet.signMessage(message)

  const formData = new FormData()
  formData.append('user_address', user_address.toLowerCase())
  formData.append('md5', image_md5)
  for (let i = 0; i < public_inputs.length; i++)
    formData.append('public_inputs', public_inputs[i])

  for (let i = 0; i < private_inputs.length; i++)
    formData.append('private_inputs', private_inputs[i])

  formData.append('input_context_type', InputContextType.ImageCurrent)

  const zkwasmHeaders = {
    'X-Eth-Signature': signature,
    'Content-Type': 'multipart/form-data',
  }

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url.proveWasmImageURL(zkwasmProverUrl).url,
    headers: {
      ...zkwasmHeaders,
    },
    data: formData,
  }

  let errorMessage = ''
  // NODE: fix this, useless var
  // let _
  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage] = handleAxiosError(error)
    isSetUpSuccess = false
  })

  // console.log('response:', response)
  return [response as AxiosResponse<any>, isSetUpSuccess as boolean, errorMessage as string]
}
