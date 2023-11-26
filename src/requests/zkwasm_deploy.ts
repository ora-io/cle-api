import axios from 'axios'
import { Wallet } from 'ethers'
import { computeAddress } from 'ethers/lib/utils'
import url from './url'
import { handleAxiosError } from './error_handle'

// Deploy verification contract
export async function zkwasm_deploy(chain_id: string, user_privatekey: string, image_md5: string, zkwasmProverUrl: string) {
  let isDeploySuccess = true

  const address = computeAddress(user_privatekey).toLowerCase()
  const wallet = new Wallet(user_privatekey)

  const message = JSON.stringify({
    user_address: address,
    md5: image_md5,
    chain_id,
  })
  const signature = await wallet.signMessage(message)

  const requestData = JSON.stringify({
    user_address: address,
    md5: image_md5,
    chain_id,
    signature,
  })

  const requestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url.deployWasmImageURL(zkwasmProverUrl).url,
    data: requestData,
    headers: {
      'Content-Type': url.deployWasmImageURL(zkwasmProverUrl).contentType['Content-Type'],
    },
  }

  let errorMessage = ''
  // NODE: fix this, useless var
  // let _
  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage] = handleAxiosError(error)
    isDeploySuccess = false
  })
  return [response, isDeploySuccess, errorMessage]
}

export async function get_deployed(zkwasmProverUrl: string, image_md5: string) {
  const requestConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url.searchImageURL(zkwasmProverUrl, image_md5).url,
  }

  let errorMessage = null
  const response = await axios.request(requestConfig).catch((error) => {
    errorMessage = error
  })
  return [response, errorMessage]
}
