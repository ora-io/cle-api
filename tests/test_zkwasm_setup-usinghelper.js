
/**
 * This is modified from https://github.com/DelphinusLab/zkWasm-service-helper#a-example-to-add-new-wasm-image. save for future work.
 * can delete after setup stable.
 */

import { Wallet } from "ethers";
import { computeAddress } from "ethers/lib/utils.js";
import {
  // AddImageParams,
  // WithSignature,
  ZkWasmUtil,
  ZkWasmServiceHelper
} from "@hyperoracle/zkwasm-service-helper";
import fs from "fs"

async function signMessage(message, sk) {
  const wallet = new Wallet(sk);
  return await wallet.signMessage(message);
}

export async function zkwasm_setup(
  ZkwasmProviderUrl,
  name,
  image_md5,
  image,
  user_privatekey,
  description_url,
  iconURL,
  circuitSize
) {

let helper = new ZkWasmServiceHelper(ZkwasmProviderUrl, "", "");
let imagePath = "tests/build/zkgraph_full.wasm";

// const image = createFileFromUint8Array(wasmUint8Array, wasmName);
let fileSelected = fs.readFileSync(imagePath);
let md5 = ZkWasmUtil.convertToMd5(
        fileSelected
      );
      
let info = {
  name: name,
  image_md5: image_md5.toLowerCase(), // fix compatible issue with new zkwasm explorer.
  image: image,
  user_address: computeAddress(user_privatekey).toLowerCase(),
  description_url: description_url,
  avator_url: iconURL,
  circuit_size: circuitSize,
};

let msg = ZkWasmUtil.createAddImageSignMessage(info);
let signature = await signMessage(msg, user_privatekey); //Need user private key to sign the msg
let task = {
        ...info,
        signature,
      };
      
  let response = (await helper.addNewWasmImage(task))

  return response;
}

