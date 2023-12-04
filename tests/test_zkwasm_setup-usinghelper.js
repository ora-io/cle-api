/**
 * This is modified from https://github.com/DelphinusLab/zkWasm-service-helper#a-example-to-add-new-wasm-image. save for future work.
 * can delete after setup stable.
 */

import fs from 'fs'
import { Wallet } from 'ethers'
import { computeAddress } from 'ethers/lib/utils.js'
import {
  // AddImageParams,
  // WithSignature,
  ZkWasmUtil,
  ZkWasmServiceHelper,
} from '@hyperoracle/zkwasm-service-helper'

async function signMessage(message, sk) {
  const wallet = new Wallet(sk)
  return await wallet.signMessage(message)
}

export async function zkwasm_setup(
  ZkwasmProviderUrl,
  name,
  image_md5,
  image,
  user_privatekey,
  description_url,
  iconURL,
  circuitSize,
) {
  const helper = new ZkWasmServiceHelper(ZkwasmProviderUrl, '', '')
  const imagePath = 'tests/build/zkgraph_full.wasm'

  // const image = createFileFromUint8Array(wasmUint8Array, wasmName);
  const fileSelected = fs.readFileSync(imagePath)
  const md5 = ZkWasmUtil.convertToMd5(
    fileSelected,
  )

  const info = {
    name,
    image_md5: image_md5.toLowerCase(), // fix compatible issue with new zkwasm explorer.
    image,
    user_address: computeAddress(user_privatekey).toLowerCase(),
    description_url,
    avator_url: iconURL,
    circuit_size: circuitSize,
  }

  const msg = ZkWasmUtil.createAddImageSignMessage(info)
  const signature = await signMessage(msg, user_privatekey) // Need user private key to sign the msg
  const task = {
    ...info,
    signature,
  }

  const response = (await helper.addNewWasmImage(task))

  return response
}

