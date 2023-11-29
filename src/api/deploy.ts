/* eslint-disable no-console */
import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import { get_deployed, zkwasm_deploy } from '../requests/zkwasm_deploy'
import { logLoadingAnimation } from '../common/log_utils'
import { waitTaskStatus } from '../requests/zkwasm_taskdetails'

/**
 * Deploy verification contract for the given image {$wasmPath}
 * @param {string} wasmUint8Array - the uint8Array format of wasm bin file
 * @param {number} chainid - the chain id of the target network
 * @param {string} zkwasmProviderUrl - the url of the zkwasm prover
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - the deployed verification contract address if success, empty string otherwise
 */
export async function deploy(wasmUint8Array: Uint8Array, chainid: string, zkwasmProviderUrl: string, userPrivateKey: string, enableLog = true): Promise<string> {
  // Get md5
  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toUpperCase()
  if (enableLog === true)
    console.log(`[*] IMAGE MD5: ${md5}`, '\n')

  const [response, isDeploySuccess, errorMessage] = await zkwasm_deploy(
    chainid,
    userPrivateKey,
    md5,
    zkwasmProviderUrl,
  )

  if (isDeploySuccess) {
    const taskId = response.data.result.id

    if (enableLog === true)
      console.log(`[+] DEPLOY TASK STARTED. TASK ID: ${taskId}`, '\n')
    return taskId
  }
  else {
    if (enableLog === true) {
      console.log('[-] DEPLOY CANNOT BE STARTED.', '\n')
      console.log(`[-] Error: ${errorMessage}.\n`)
    }
    return ''
  }
}

export async function waitDeploy(
  zkwasmProviderUrl: string,
  taskId: string,
  md5: string,
  chainid: string,
  enableLog = true,
) {
  let loading
  if (enableLog === true) {
    console.log('[*] Please wait for deployment...', '\n')
    loading = logLoadingAnimation()
  }

  const taskDetails = await waitTaskStatus(zkwasmProviderUrl, taskId, ['Done', 'Fail'], 3000, 0).catch((error) => {
    throw error

    // if (enableLog === true) {
    //   loading.stopAndClear();
    //   console.error(error);
    // }
    // return "";
  }) // TODO: timeout

  if (taskDetails?.status === 'Done') {
    if (enableLog === true) {
      loading?.stopAndClear()
      console.log('[+] DEPLOY SUCCESS!', '\n')
    }

    // const [res, _] = await get_deployed("63715F93C83BD315345DFDE9A6E0F814");
    const [res] = await get_deployed(zkwasmProviderUrl, md5)

    const verificationContractAddress = res?.data.result[0].deployment.find(
      (x: any) => x.chain_id === chainid,
    ).address as string

    if (enableLog === true)
      console.log(`[+] CONTRACT ADDRESS: ${verificationContractAddress}`, '\n')

    return verificationContractAddress
  }
  else {
    if (enableLog === true) {
      loading?.stopAndClear()
      console.log('[-] DEPLOY FAILED.', '\n')
      console.log(`[-] ${taskDetails.internal_message}`, '\n')
    }

    return ''
  }
}
