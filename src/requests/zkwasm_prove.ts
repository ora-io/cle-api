import type { AxiosResponse } from 'axios'
import axios from 'axios'
import { Wallet } from 'ethers'
import { computeAddress } from 'ethers/lib/utils'
import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import { handleAxiosError } from './error_handle'
import url from './url'
// import { sign } from "crypto";

export async function zkwasm_prove(
  zkwasmProverUrl: string,
  user_privatekey: string,
  image_md5: string,
  public_inputs: string[],
  private_inputs: string[],
): Promise<[AxiosResponse<any, any>, boolean, string]> {
  let isSetUpSuccess = true

  const user_address = computeAddress(user_privatekey).toLowerCase()

  const message = ZkWasmUtil.createProvingSignMessage({
    user_address: user_address.toLowerCase(),
    md5: image_md5.toUpperCase(),
    public_inputs,
    private_inputs,
  })

  // console.log('message', message)

  // let message = JSON.stringify({
  //   user_address,
  //   md5: image_md5.toLowerCase(),
  //   public_inputs: public_inputs,
  //   private_inputs: private_inputs,
  // });

  const wallet = new Wallet(user_privatekey)
  const signature = await wallet.signMessage(message)

  // let formData = new FormData();
  // formData.append("user_address", user_address);
  // formData.append("md5", image_md5);
  // formData.append("public_inputs", public_inputs);
  // formData.append("private_inputs", private_inputs);
  // formData.append("signature", signature);
  const req = JSON.stringify({
    user_address: user_address.toLowerCase(),
    md5: image_md5.toUpperCase(),
    public_inputs,
    private_inputs,
    // signature,
  })

  const zkwasmHeaders = {
    'X-Eth-Address': user_address.toLowerCase(),
    'X-Eth-Signature': signature,
  }

  // console.log('signature:', signature)

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url.proveWasmImageURL(zkwasmProverUrl).url,
    headers: {
      ...url.proveWasmImageURL(zkwasmProverUrl).contentType,
      ...zkwasmHeaders,
    },
    data: req,
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
