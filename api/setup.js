import {readFileSync} from "fs";
import fs from "fs";
import {ZkWasmUtil} from "zkwasm-service-helper";
import {
    logLoadingAnimation
} from "../common/utils.js";
import {zkwasm_setup} from "../requests/zkwasm_setup.js";
import {
    waitTaskStatus,
    taskPrettyPrint,
} from "../requests/zkwasm_taskdetails.js";
import path from "path";

/**
 * Set up zkwasm image with given wasm file.
 * @param {string} wasmPath
 * @param {string} userPrivateKey
 * @param {string} ZkwasmProviderUrl
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {[string, object]} - errmsg, result = {'md5': md5, 'taskId': taskId}
 */
export async function setup(wasmPath, circuitSize, userPrivateKey, ZkwasmProviderUrl, isLocal = false, enableLog = true) {
    let err = null
    let result = {'md5': null, 'taskId': null}

    let cirSz;
    if (circuitSize >= 18 && circuitSize <= 30){
        cirSz = circuitSize
    } else { // if too ridiculous, set to default
        cirSz = isLocal ? 20 : 22;
    }
    // Message and form data
    const name = path.basename(wasmPath); // only use in zkwasm, can diff from local files
    const md5 = ZkWasmUtil.convertToMd5(readFileSync(wasmPath)).toUpperCase();
    const image = fs.createReadStream(wasmPath);
    const description_url_encoded = "";
    const avator_url = "";
    const circuit_size = cirSz;

    result['md5'] = md5

    let [response, isSetUpSuccess, errorMessage] = await zkwasm_setup(
        ZkwasmProviderUrl,
        name,
        md5,
        image,
        userPrivateKey,
        description_url_encoded,
        avator_url,
        circuit_size
    );

    if (isSetUpSuccess) {

        const taskId = response.data.result.id
        result['taskId'] = taskId

        let loading
        if(enableLog) {
            console.log(`[+] IMAGE MD5: ${response.data.result.md5}`, "\n");

            console.log(
                `[+] SET UP TASK STARTED. TASK ID: ${taskId}`,
                "\n",
            );

            console.log("[*] Please wait for image set up... (estimated: 1-5 min)", "\n");

            loading = logLoadingAnimation();
        }

        let taskDetails;
        try {
            taskDetails = await waitTaskStatus(
                ZkwasmProviderUrl,
                taskId,
                ["Done", "Fail"],
                3000,
                0,
            ); //TODO: timeout
        } catch (error) {

            if(enableLog) {
                loading.stopAndClear();
                console.error(error);
            }
            return "Unexpected error, please contact the dev if you can't solve it.", result
        }

        const taskStatus = taskDetails.status === "Done" ? "SUCCESS" : "FAILED";

        if(enableLog) {
            loading.stopAndClear();

            console.log(
                `[${taskStatus === "SUCCESS" ? "+" : "-"}] SET UP ${taskStatus}`,
                "\n",
            );

            // Log extra new line before divider.
            console.log();

            taskPrettyPrint(taskDetails, "[*] ");
        }
    } else {
        if(enableLog) {
            console.log(`[*] IMAGE MD5: ${md5}`, "\n");

            // Log status
            console.log(`[-] ${errorMessage}`, "\n");
        }
    }

    return [err, result]
}


