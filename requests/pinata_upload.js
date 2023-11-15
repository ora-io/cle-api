import url from "./url.js";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { handleAxiosError } from "./error_handle.js";
import { ZkWasmUtil } from "@hyperoracle/zkwasm-service-helper";

export async function pinata_upload(
  // userAddress,
  wasmPath,
  mappingPath,
  yamlPath,
  // zkGraphName,
  pinataEndpoint,
  pinataJWT,
) {
  let isUploadSuccess = true;

  // TODO: upload src/ rather than mapping only
  const mappingFile = fs.createReadStream(mappingPath);
  const wasmFile = fs.createReadStream(wasmPath);
  const yamlFile = fs.createReadStream(yamlPath);

  const wasmU8A = new Uint8Array(fs.readFileSync(wasmPath));
  const yamlU8A = new Uint8Array(fs.readFileSync(yamlPath));

  var mergedArray = new Uint8Array(wasmU8A.length + yamlU8A.length);
  mergedArray.set(wasmU8A);
  mergedArray.set(yamlU8A, wasmU8A.length);
  const md5_merged = ZkWasmUtil.convertToMd5(mergedArray).toUpperCase();

  const directoryName = `zkgraph-md5-${md5_merged}`;

  const formData = new FormData();
  formData.append("file", mappingFile, {
    filepath: `${directoryName}/mapping.ts`,
  });
  formData.append("file", wasmFile, {
    filepath: `${directoryName}/zkgraph.wasm`,
  });
  formData.append("file", yamlFile, {
    filepath: `${directoryName}/zkgraph.yaml`,
  });

  const metadata = JSON.stringify({
    name: directoryName,
  });
  formData.append("pinataMetadata", metadata);

  let requestConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: url.uploadToPinata(pinataEndpoint).url,
    headers: {
      Authorization: `Bearer ${pinataJWT}`,
      ...formData.getHeaders(),
    },
    data: formData,
  };

  let errorMessage = "";
  let _;
  const response = await axios.request(requestConfig).catch((error) => {
    [errorMessage, _] = handleAxiosError(error);
    isUploadSuccess = false;
  });

  return [response, isUploadSuccess, errorMessage];
}
