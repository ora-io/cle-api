import FormData from "form-data";
import axios from "axios";
import url from "./url.js";
import { Wallet } from "ethers";
import { ZkWasmUtil } from "zkWasm-service-helper";
import { computeAddress } from "ethers/lib/utils.js";
import { handleAxiosError } from "./error_handle.js";
import { ImageAlreadyExists, PaymentError } from "../common/error.js";

export async function zkwasm_setup(
  ZkwasmProviderUrl,
  name,
  image_md5,
  image,
  user_privatekey,
  description_url,
  avator_url,
  circuit_size
) {
  let isSetUpSuccess = true;

  const user_address = computeAddress(user_privatekey).toLowerCase();

  let message = ZkWasmUtil.createAddImageSignMessage({
    name: name,
    image_md5: image_md5,
    image: image,
    user_address: user_address,
    description_url: description_url,
    avator_url: avator_url,
    circuit_size: circuit_size,
  });

  const wallet = new Wallet(user_privatekey);
  let signature = await wallet.signMessage(message);

  let formData = new FormData();
  formData.append("name", name);
  formData.append("image_md5", image_md5);
  formData.append("image", image);
  formData.append("user_address", user_address);
  formData.append("description_url", description_url);
  formData.append("avator_url", avator_url);
  formData.append("circuit_size", circuit_size);
  formData.append("signature", signature);

  let requestConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: url.postNewWasmImage(ZkwasmProviderUrl).url,
    headers: {
      ...formData.getHeaders(),
    },
    data: formData,
  };

  let response;

  let errorMessage = "";
  let isRetry;
  //TODO: should change to setTimeInterval.
  let retry_time = 1;
  for (let i = 0; i < retry_time + 1; i++){
    
    response = await axios.request(requestConfig).catch((error) => {
        [errorMessage, isRetry] = handleAxiosError(error);
        if (isRetry){
            // pass
        } else if (errorMessage == "Error: Image already exists!"){
            throw new ImageAlreadyExists(errorMessage);
        } else if (errorMessage.startsWith('Payment error')){
            throw new PaymentError(errorMessage);
        } else {
            // console.error("Error in zkwasm_setup. Please retry.");
            throw error;
        }
        // errorMessage = error.response.data;
      });
      if (!isRetry) {
        break;
      }
      // for debug purpose, can delete after stable.
      console.log(errorMessage, "retrying..")
    }
  return response;
}
