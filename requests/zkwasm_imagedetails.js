import axios from "axios";
import url from "./url.js";

export async function zkwasm_imagedetails(zkwasmProverUrl, md5) {
  let requestConfig = {
    method: "get",
    maxBodyLength: Infinity,
    url: url.searchImageURL(zkwasmProverUrl, md5).url,
    headers: {
      ...url.searchImageURL(zkwasmProverUrl, md5).contentType,
    },
  };

  let errorMessage = null;
  const response = await axios.request(requestConfig).catch((error) => {
    errorMessage = error;
  });
  return [response, errorMessage];
}
