import { toHexStringBytes32Reverse } from "../common/utils.js";
import { logLoadingAnimation } from "../common/log_utils.js";
import { zkwasm_prove } from "../requests/zkwasm_prove.js";
import { ZkWasmUtil } from "@hyperoracle/zkwasm-service-helper";
import {
  waitTaskStatus,
  taskPrettyPrint,
} from "../requests/zkwasm_taskdetails.js";

/**
 * Submit prove task to a given zkwasm and return the proof details.
 * @param {object} zkGraphExecutable 
 * @param {string} privateInputStr - the packed private input in hex string
 * @param {string} publicInputStr - the packed public input in hex string
 * @param {string} zkwasmProverUrl - the url of the zkwasm prover
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {object} - proof task details in json
 */
export async function prove(
  zkGraphExecutable,
  privateInputStr,
  publicInputStr,
  zkwasmProverUrl,
  userPrivateKey,
  enableLog = true
) {
  let result = {
    md5: null,
    taskId: null,
  };
  const { wasmUint8Array } = zkGraphExecutable;

  // Prove mode
  const privateInputArray = privateInputStr.trim().split(" ");
  const publicInputArray = publicInputStr.trim().split(" ");

  // Message and form data
  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toUpperCase();

  result["md5"] = md5;

  let [response, isSetUpSuccess, errorMessage] = await zkwasm_prove(
    zkwasmProverUrl,
    userPrivateKey,
    md5,
    publicInputArray,
    privateInputArray
  ).catch((error) => {
    throw error;
  });

  if (enableLog) {
    console.log(`[*] IMAGE MD5: ${md5}`, "\n");
  }

  if (isSetUpSuccess) {
    //   console.log(`[+] IMAGE MD5: ${response.data.result.md5}`, "\n");

    const taskId = response.data.result.id;
    result["taskId"] = taskId;

    if (enableLog) {
      console.log(`[+] PROVE TASK STARTED. TASK ID: ${taskId}`, "\n");

      console.log(
        "[*] Please wait for proof generation... (estimated: 1-5 min)",
        "\n"
      );
    }
  } else {
    if (enableLog) {
      console.log(`[-] PROVE CANNOT BE STARTED. MIGHT NEED TO SETUP`, "\n");
    }
  }

  return result;
}

export async function waitProve(
  zkwasmProverUrl,
  taskId,
  enableLog = true
) {

  let result = {
    instances: null,
    batch_instances: null,
    proof: null,
    aux: null,
    md5: null,
    taskId: null,
  };

  let loading;

  if (enableLog) {
    loading = logLoadingAnimation();
  }

  let taskDetails;
  try {
    taskDetails = await waitTaskStatus(
      zkwasmProverUrl,
      taskId,
      ["Done", "Fail", "DryRunFailed"],
      3000,
      0
    ).catch((err) => {
      throw err;
    }); //TODO: timeout
  } catch (error) {
    loading.stopAndClear();
    throw error;
  }

  if (taskDetails.status === "Done") {
    if (enableLog) {
      loading.stopAndClear();
      console.log("[+] PROVE SUCCESS!", "\n");
    }

    const instances = toHexStringBytes32Reverse(taskDetails.instances);
    const batch_instances = toHexStringBytes32Reverse(
      taskDetails.batch_instances
    );
    const proof = toHexStringBytes32Reverse(taskDetails.proof);
    const aux = toHexStringBytes32Reverse(taskDetails.aux);
    if (enableLog) {
      taskPrettyPrint(taskDetails, "[*] ");

      console.log();
    }
    result["instances"] = instances;
    result["batch_instances"] = batch_instances;
    result["proof"] = proof;
    result["aux"] = aux;
    result["taskId"] = taskId;
  } else {
    result["taskId"] = taskId;

    if (enableLog) {
      loading.stopAndClear();

      console.log("[-] PROVE OR DRYRUN FAILED.", "\n");
    }
  }

  return result;
}
