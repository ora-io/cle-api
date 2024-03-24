import axios from 'axios'
import { logger } from 'zkwasm-toolchain'
import url from './url.js'
import { handleAxiosError } from './error_handle.js'

export async function zkwasm_imagedetails(zkwasmProverUrl: string, md5: string) {
  const requestConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url.searchImageURL(zkwasmProverUrl, md5.toUpperCase()).url,
    headers: {
      ...url.searchImageURL(zkwasmProverUrl, md5.toUpperCase()).contentType,
    },
  }

  // let errorMessage = null
  // const response = await axios.request(requestConfig).catch((error) => {
  //   errorMessage = error
  // })

  let errorMessage = null

  // TODO: should change to setTimeInterval.
  const retry_time = 1
  let response
  let isRetry
  for (let i = 0; i < retry_time + 1; i++) {
    response = await axios.request(requestConfig).catch((error) => {
      [errorMessage, isRetry] = handleAxiosError(error)
      if (isRetry) {
        // pass
      }
      else {
        // console.error("Error in ora_prove. Please retry.");
        // throw error;
        logger.error(error.message)
      }
      // errorMessage = error.response.data;
    })
    if (!isRetry)
      break

    // for debug purpose, can delete after stable.
    logger.log(errorMessage, 'retrying..')
  }

  return [response, errorMessage]
}
