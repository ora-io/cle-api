import axios from 'axios'
import url from './url.js'

export async function zkwasm_imagedetails(zkwasmProverUrl: string, md5: string) {
  const requestConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url.searchImageURL(zkwasmProverUrl, md5.toUpperCase()).url,
    headers: {
      ...url.searchImageURL(zkwasmProverUrl, md5.toUpperCase()).contentType,
    },
  }

  let errorMessage = null
  const response = await axios.request(requestConfig).catch((error) => {
    errorMessage = error
  })
  return [response, errorMessage]
}
