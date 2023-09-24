import {ZkWasmUtil} from "zkwasm-service-helper";
import {
    logLoadingAnimation
} from "../common/log_utils.js";
import {zkwasm_setup} from "../requests/zkwasm_setup.js";
import {
    waitTaskStatus,
    taskPrettyPrint,
} from "../requests/zkwasm_taskdetails.js";
import { createFileFromUint8Array } from "../common/api_helper.js";
import { ImageAlreadyExists } from "../common/error.js";
import { zkwasm_imagetask } from "../requests/zkwasm_imagetask.js";

/**
 * Set up zkwasm image with given wasm file.
 * @param {string} wasmName
 * @param {string} wasmUnit8Array
 * @param {number} circuitSize
 * @param {string} userPrivateKey
 * @param {string} ZkwasmProviderUrl
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {{string, string, boolean}} - {'md5': md5, 'taskId': taskId, 'success': success}
 */
export async function setup(wasmName, wasmUnit8Array, circuitSize, userPrivateKey, ZkwasmProviderUrl, isLocal = false, enableLog = true) {
    let result = {'md5': null, 'taskId': null, 'success': null}

    let cirSz;
    if (circuitSize >= 18 && circuitSize <= 30){
        cirSz = circuitSize
    } else { // if too ridiculous, set to default
        cirSz = isLocal ? 20 : 22;
        if (enableLog){
            console.warn("[-] Warning: circuit size [", cirSz,"] was impractical, reset to default:", cirSz)
        }
    }

    const md5 = ZkWasmUtil.convertToMd5(wasmUnit8Array).toUpperCase();
    const image = createFileFromUint8Array(wasmUnit8Array, wasmName);
    const description_url_encoded = "";
    const avator_url = "";
    const circuit_size = cirSz;

    if(enableLog) {
        console.log(`[+] IMAGE MD5: ${md5}`, "\n");
    }

    let taskDetails;
    let taskId;
    let setupStatus;
    let isNeedWait = false;

    await zkwasm_setup(
        ZkwasmProviderUrl,
        wasmName,  // only use in zkwasm, can diff from local files
        md5,
        image,
        userPrivateKey,
        description_url_encoded,
        avator_url,
        circuit_size
    ).then(async (response) => {
        taskId = response.data.result.id;

        isNeedWait = true;

        if(enableLog) {
            console.log(
                `[+] SET UP TASK STARTED. TASK ID: ${taskId}`,
                "\n",
            );
        };
    }).catch (async (error) => {
        // return the last status if exists
        if (error instanceof ImageAlreadyExists){
            // check if there's any "Reset" task before
            let res = await zkwasm_imagetask(ZkwasmProviderUrl, md5, 'Reset');
            // if no "Reset", check "Setup"
            if (res.data.result.total == 0){
                res = await zkwasm_imagetask(ZkwasmProviderUrl, md5, 'Setup')
            }

            taskDetails = res.data.result.data[0];
            taskId = res.data.result.data[0]._id.$oid;
            setupStatus = res.data.result.data[0].status;

            isNeedWait = (setupStatus == "Pending" || setupStatus == "Processing");

            if(enableLog) {
                console.log(`[*] IMAGE ALREADY EXISTS. PREVIOUS SETUP TASK ID: ${taskId}`, "\n",
            );
            }
        } else {
            throw error;
        }
    });

    let loading;

    if (isNeedWait){
        if(enableLog) {
            console.log("[*] Please wait for image set up... (estimated: 1-5 min)", "\n");
            loading = logLoadingAnimation();
        }

        taskDetails = await waitTaskStatus(
            ZkwasmProviderUrl,
            taskId,
            ["Done", "Fail"],
            3000,
            0,
        ); //TODO: timeout
        setupStatus = taskDetails.status;

        if(enableLog) {
            loading.stopAndClear();
        }
    }

    if(enableLog) {
        taskPrettyPrint(taskDetails, "[*] ");

        const taskStatus = setupStatus === "Done" ? "SUCCESS" : "FAILED";
        console.log(
            `[${taskStatus === "SUCCESS" ? "+" : "-"}] SET UP ${taskStatus}`,
            "\n",
        );
    }

    result['md5'] = md5
    result['success'] = setupStatus === "Done" ? true : false;
    result['taskId'] = taskId;
    return result
}

