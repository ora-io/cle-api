import axios from "axios";
import url from "./url.js";
import { Wallet } from "ethers";
import { computeAddress } from "ethers/lib/utils.js";
import { handleAxiosError } from "./error_handle.js";
import { ZkWasmUtil } from "@hyperoracle/zkwasm-service-helper";
// import { sign } from "crypto";

export async function zkwasm_prove(
  zkwasmProverUrl,
  user_privatekey,
  image_md5,
  public_inputs,
  private_inputs,
) {
  let isSetUpSuccess = true;

  const user_address = computeAddress(user_privatekey).toLowerCase();

  let message = ZkWasmUtil.createProvingSignMessage({
    user_address: user_address.toLowerCase(),
    md5: image_md5.toUpperCase(),
    public_inputs: public_inputs,
    private_inputs: private_inputs,
  });


  // console.log('message', message)

  // let message = JSON.stringify({
  //   user_address,
  //   md5: image_md5.toLowerCase(),
  //   public_inputs: public_inputs,
  //   private_inputs: private_inputs,
  // });

  const wallet = new Wallet(user_privatekey);
  let signature = await wallet.signMessage(message);

  // let formData = new FormData();
  // formData.append("user_address", user_address);
  // formData.append("md5", image_md5);
  // formData.append("public_inputs", public_inputs);
  // formData.append("private_inputs", private_inputs);
  // formData.append("signature", signature);
  const req = JSON.stringify({
    user_address: user_address.toLowerCase(),
    md5: image_md5.toUpperCase(),
    public_inputs: public_inputs,
    private_inputs: private_inputs,
    // signature,
  });

  let zkwasmHeaders = {
    "X-Eth-Address": user_address.toLowerCase(),
    "X-Eth-Signature": signature
  }

  // console.log('signature:', signature)

  let requestConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: url.proveWasmImageURL(zkwasmProverUrl).url,
    headers: {
      ...url.proveWasmImageURL(zkwasmProverUrl).contentType,
      ...zkwasmHeaders,
    },
    data: req,
  };

  let errorMessage = "";
  let _;
  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage, _] = handleAxiosError(error);
    isSetUpSuccess = false;
  });

  // console.log('response:', response)
  return [response, isSetUpSuccess, errorMessage];
}
