import type { AxiosError } from 'axios'
import { logger } from '../common'

export function handleAxiosError(error: AxiosError): [string, boolean] {
  let errMsg = ''
  let isRetry = false // stop by default
  switch (error.code) {
    case 'ENOTFOUND':
      // NODE: fix this use `error.response?.config.baseURL` , original code is `error.hostname;`
      errMsg = `Can't connect to ${error.response?.config.baseURL}`
      break
    case 'ERR_BAD_RESPONSE':
      if (error.response) {
        switch (error.response.status) {
          case 500:
            errMsg = error.response.data as any
            break
          case 502:
            isRetry = true
            break
          default:
            errMsg = `ERR_BAD_RESPONSE: ${error.response.status} ${error.response.statusText}.`
            break
        }
        break
      }
      break
    case 'ERR_BAD_REQUEST':
      errMsg = `ERR_BAD_REQUEST: ${error.response?.status} ${error.response?.statusText}.`
      break
    default:
      logger.log('in handleAxiosError:')
      logger.log(error)
      errMsg = `HTTP ERROR: ${error.response?.status} ${error.response?.statusText}.`
      break
  }
  return [errMsg, isRetry]
}
