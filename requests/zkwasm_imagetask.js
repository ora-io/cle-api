import axios from "axios";
import url from "./url.js";

export async function zkwasm_imagetask(zkwasmProverUrl, md5, taskType) {
  let requestConfig = {
    method: "get",
    maxBodyLength: Infinity,
    url: url.checkWasmImageStatus(zkwasmProverUrl, md5.toUpperCase(), taskType).url,
    headers: {
      ...url.checkWasmImageStatus(zkwasmProverUrl, md5.toUpperCase(), taskType).contentType,
    },
  };

//   let errorMessage = null;
  const response = await axios.request(requestConfig)//.catch((error) => {
//     errorMessage = error;
//   });
//   return [response, errorMessage];
  return response;
}
