import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'
import { logger } from '../common'
import url from './url'
import { handleAxiosError } from './error_handle'

export async function zkwasm_taskdetails(zkwasmProverUrl: string, taskId: string): Promise<[AxiosResponse<any, any>, null | AxiosError]> {
  // let isSetUpSuccess = true;

  const requestConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url.getTaskDetails(zkwasmProverUrl, taskId).url,
    headers: {
      ...url.getTaskDetails(zkwasmProverUrl).contentType,
    },
  }

  let errorMessage: null | AxiosError = null
  const response = await axios.request(requestConfig).catch((error) => {
    // isSetUpSuccess = false;
    // console.log(error.message)

    // if (error.code == 'ENOTFOUND'){
    //     errorMessage = "Can't connect to " + error.hostname;
    // }else{
    //     console.log(error)
    //     errorMessage = error.code;
    // }
    errorMessage = error
    // errorMessage = error.response.data;//todo: is this usefull?
  })
  return [response as AxiosResponse<any, any>, errorMessage]
}

// TODO: timeout
export async function waitTaskStatus(
  zkwasmProverUrl: any,
  taskId: any,
  statuslist: { [x: string]: any },
  interval: number | undefined,
  _timeout = 0,
) {
  // let done = false;
  // setInterval(() => {
  //     var [response, isSetUpSuccess, errorMessage] = await zkwasm_taskdetails(taskId)
  //     if(response.data.result.data[0].status == 'Done'){
  //         done = true
  //         return
  //     }
  // }, interval)
  // var [response, isSetUpSuccess, errorMessage] = await zkwasm_taskdetails(taskId)
  return new Promise<any>((resolve, reject) => {
    const checkStatus = async () => {
      const [response, error] = await zkwasm_taskdetails(zkwasmProverUrl, taskId)

      if (error !== null) {
        const [errMsg, isRetry] = handleAxiosError(error)
        if (isRetry) {
          logger.log(errMsg, 'Retry.')
          setTimeout(checkStatus, interval)
        }
        else {
          // stop
          reject(errMsg)
        }
      }
      else {
        const status = response.data.result.data[0].status // Call function A to check data status
        let matched = false
        for (const i in statuslist) {
          if (status === statuslist[i]) {
            matched = true
            break
          }
        }
        if (matched)
          resolve(response.data.result.data[0]) // Resolve the promise when the status is matched

        else
          setTimeout(checkStatus, interval) // Call checkStatus function again after a 1-second delay
      }
    }

    checkStatus() // Start checking the data status
  })
}

function millToHumanReadable(mill: number) {
  const min = Math.floor(mill / 60000)
  const sec = (mill % 60000) / 1000
  return `${min} min ${sec} sec`
}

export function taskPrettyPrint(resData: { submit_time: string | number | Date; process_started: number; process_finished: number }, prefix = '') {
  logger.log(`${prefix}Task submit time: ${resData.submit_time}`)
  logger.log(`${prefix}Process started: ${resData.process_started}`)
  logger.log(`${prefix}Process finished: ${resData.process_finished}`)
  logger.log(
    `${prefix}Pending time: ${millToHumanReadable(
      // @ts-expect-error TODO: fix this, it's incorrect, should new Date().getTime() or other
      new Date(resData.process_started) - new Date(resData.submit_time),
    )}`,
  )
  logger.log(
    `${prefix}Running time: ${millToHumanReadable(
      // @ts-expect-error TODO: fix this, it's incorrect, should new Date().getTime() or other
      new Date(resData.process_finished) - new Date(resData.process_started),
    )}`,
  )
}

// try{
// let a = await waitTaskStatus('64c0c2bbf0e3eee93f75c260', ['Done', 'Fail'], 100);
// // console.log(a)
// taskPrettyPrint(a, '[*] ')
// }catch(error) {
//     console.log(error)
// }
// var [response, errorMessage] =await zkwasm_taskdetails('64c0c2bbf0e3eee93f75c260')
// console.log(response.data.result.data[0].status)
