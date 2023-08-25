import {
  toHexStringBytes32Reverse,
} from "../common/utils.js";
import { logLoadingAnimation } from "../common/log_utils.js";
import { zkwasm_prove } from "../requests/zkwasm_prove.js";
import { readFileSync } from "fs";
import { ZkWasmUtil } from "zkwasm-service-helper";
import {
  waitTaskStatus,
  taskPrettyPrint,
} from "../requests/zkwasm_taskdetails.js";

/**
 * Submit prove task to a given zkwasm and return the proof details.
 * @param {string} wasmPath - the relative path to the wasm bin file
 * @param {string} privateInputStr - the packed private input in hex string
 * @param {string} publicInputStr - the packed public input in hex string
 * @param {string} zkwasmProverUrl - the url of the zkwasm prover
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {[string, object]} - 1st arg: err, return null when succ, string when failed; 2nd arg: proof details in json
 */
export async function prove(wasmPath, privateInputStr, publicInputStr, zkwasmProverUrl, userPrivateKey, enableLog=true) {
    let err = null;
    let result = {"instances":null, "batch_instances":null, "proof":null, "aux":null, "md5": null, "taskId": null};

    // Prove mode
    const compiledWasmBuffer = readFileSync(wasmPath);
    const privateInputArray = privateInputStr.trim().split(" ");
    const publicInputArray = publicInputStr.trim().split(" ");

    // Message and form data
    const md5 = ZkWasmUtil.convertToMd5(compiledWasmBuffer).toUpperCase();

    result['md5'] = md5

    let [response, isSetUpSuccess, errorMessage] = await zkwasm_prove(
      zkwasmProverUrl,
      userPrivateKey,
      md5,
      publicInputArray,
      privateInputArray,
    );

    if (enableLog) {
        console.log(`[*] IMAGE MD5: ${md5}`, "\n");
    }

    if (isSetUpSuccess) {
      //   console.log(`[+] IMAGE MD5: ${response.data.result.md5}`, "\n");

      const taskId = response.data.result.id;

    if (enableLog) {
      console.log(`[+] PROVE TASK STARTED. TASK ID: ${taskId}`, "\n");

      console.log(
        "[*] Please wait for proof generation... (estimated: 1-5 min)",
        "\n",
      );
    }

      let loading;

      if (enableLog) {
        loading = logLoadingAnimation();
      }

      let taskDetails;
      try {
        taskDetails = await waitTaskStatus(zkwasmProverUrl, taskId, ["Done", "Fail", "DryRunFailed"], 3000, 0); //TODO: timeout
      } catch (error) {
        loading.stopAndClear();
        console.error(error);
        process.exit(1);
      }

      if (taskDetails.status === "Done") {

        if (enableLog) {
            loading.stopAndClear();

            console.log("[+] PROVE SUCCESS!", "\n");
        }


        const instances = toHexStringBytes32Reverse(taskDetails.instances);
        const batch_instances = toHexStringBytes32Reverse(taskDetails.batch_instances);
        const proof = toHexStringBytes32Reverse(taskDetails.proof);
        const aux = toHexStringBytes32Reverse(taskDetails.aux);

        // write proof to file as txt
        // let outputProofFile = `build/proof_${taskId}.txt`;

        // if (enableLog) {
        //     console.log(`[+] Proof written to ${outputProofFile} .\n`);
        // }

        // writeFileSync(
        //   outputProofFile,
        //   "Instances:\n" +
        //     instances +
        //     "\n\nProof transcripts:\n" +
        //     proof +
        //     "\n\nAux data:\n" +
        //     aux +
        //     "\n",
        // );

        if (enableLog) {
            taskPrettyPrint(taskDetails, "[*] ");

            // Log extra new line before divider.
            console.log();
        }


        // logDivider();

        err = null
        result['instances'] = instances
        result['batch_instances'] = batch_instances
        result['proof'] = proof
        result['aux'] = aux
        result['taskId'] = taskId

        // process.exit(0);
      } else {

        err = taskDetails.internal_message
        result['taskId'] = taskId

        if (enableLog) {
            loading.stopAndClear();

            console.log("[-] PROVE OR DRYRUN FAILED.", "\n");

            console.log(`[-] ${err}`, "\n");
        }
        // logDivider();

        // process.exit(1);
      }
    } else {

        err = errorMessage

        if (enableLog) {
          console.log(`[-] PROVE CANNOT BE STARTED. MIGHT NEED TO SETUP`, "\n");
          // Log status
          console.log(`[-] ${err}`, "\n");
        }
    //   logDivider();
    }

    return [err, result]
}
