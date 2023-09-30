import { zkwasm_deploy, get_deployed } from "../requests/zkwasm_deploy.js";
import { ZkWasmUtil } from "zkWasm-service-helper";
import { logLoadingAnimation } from "../common/log_utils.js";
import { waitTaskStatus } from "../requests/zkwasm_taskdetails.js";

/**
 * Deploy verification contract for the given image {$wasmPath}
 * @param {string} wasmUnit8Array - the uint8Array format of wasm bin file
 * @param {number} chainid - the chain id of the target network
 * @param {string} zkwasmProviderUrl - the url of the zkwasm prover
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - the deployed verification contract address if success, empty string otherwise
 */
export async function deploy(wasmUnit8Array, chainid, zkwasmProviderUrl, userPrivateKey, enableLog = true) {
  // Get md5
  const md5 = ZkWasmUtil.convertToMd5(wasmUnit8Array).toUpperCase();
  if (enableLog === true) console.log(`[*] IMAGE MD5: ${md5}`, "\n");

  let [response, isDeploySuccess, errorMessage] = await zkwasm_deploy(
    chainid,
    userPrivateKey,
    md5,
    zkwasmProviderUrl
    // "63715F93C83BD315345DFDE9A6E0F814"
  );

if (isDeploySuccess) {
  const taskId = response.data.result.id;

  let loading;
  if (enableLog === true) {
    console.log(`[+] DEPLOY TASK STARTED. TASK ID: ${taskId}`, "\n");
    console.log("[*] Please wait for deployment... (estimated: 30 sec)", "\n");
    loading = logLoadingAnimation();
  }


  let taskDetails;
  try {
    taskDetails = await waitTaskStatus(zkwasmProviderUrl, taskId, ["Done", "Fail"], 3000, 0); //TODO: timeout
  } catch (error) {
    throw error;
    // if (enableLog === true) {
    //   loading.stopAndClear();
    //   console.error(error);
    // }
    // return "";
  }

  if (taskDetails.status === "Done") {
    if (enableLog === true) {
      loading.stopAndClear();
      console.log("[+] DEPLOY SUCCESS!", "\n");
    }

    // const [res, _] = await get_deployed("63715F93C83BD315345DFDE9A6E0F814");
    const [res, _] = await get_deployed(zkwasmProviderUrl, md5);

    const verificationContractAddress = res.data.result[0].deployment.find(
      (x) => x.chain_id == chainid
    ).address;

    if (enableLog === true) {
      console.log(
        `[+] CONTRACT ADDRESS: ${verificationContractAddress}`,
        "\n"
      );
    }

    return verificationContractAddress;
  } else {
    if (enableLog === true) {
      loading.stopAndClear();
      console.log("[-] DEPLOY FAILED.", "\n");
      console.log(`[-] ${taskDetails.internal_message}`, "\n");
    }

    return "";
  }
} else {
  if (enableLog === true) {
    console.log(`[-] DEPLOY CANNOT BE STARTED.`, "\n");
    console.log(`[-] Error: ${errorMessage}.\n`);
  }
  return "";
}
}
