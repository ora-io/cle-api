import {readFileSync} from "fs";
import fs from "fs";
import {ZkWasmUtil} from "zkwasm-service-helper";
import {
    logLoadingAnimation
} from "../common/log_utils.js";
import {zkwasm_setup} from "../requests/zkwasm_setup.js";
import {
    waitTaskStatus,
    taskPrettyPrint,
} from "../requests/zkwasm_taskdetails.js";
import path from "path";
import { ImageAlreadyExists } from "../common/error.js";
import { zkwasm_imagetask } from "../requests/zkwasm_imagetask.js";

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
    let result = {'md5': null, 'taskId': null, 'success': null}

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

    if(enableLog) {
        console.log(`[+] IMAGE MD5: ${md5}`, "\n");
    }

    let response;
    let taskId;
    let setupStatus;
    try{
        response = await zkwasm_setup(
            ZkwasmProviderUrl,
            name,
            md5,
            image,
            userPrivateKey,
            description_url_encoded,
            avator_url,
            circuit_size
        );
        taskId = response.data.result.id;

        let loading
        if(enableLog) {
            console.log(
                `[+] SET UP TASK STARTED. TASK ID: ${taskId}`,
                "\n",
            );

            console.log("[*] Please wait for image set up... (estimated: 1-5 min)", "\n");

            loading = logLoadingAnimation();
        }

        const taskDetails = await waitTaskStatus(
            ZkwasmProviderUrl,
            taskId,
            ["Done", "Fail"],
            3000,
            0,
        ); //TODO: timeout
        setupStatus = taskDetails.status;

        taskPrettyPrint(taskDetails, "[*] ");
            // if(enableLog) {
            //     loading.stopAndClear();
            //     console.error(error);
            // }
            // return "Unexpected error, please contact the dev if you can't solve it.", result
        // } finally {
        if(enableLog) {
            loading.stopAndClear();
        }
        // }

    } catch (error){
        if (error instanceof ImageAlreadyExists){
            // return the last status;
            // taskId = getSetupTaskIdByImage(md5)
            let res = await zkwasm_imagetask(ZkwasmProviderUrl, md5, 'Reset');

            // console.log(res.data.result.data[0]);
            if (res.data.result.total == 0){
                res = await zkwasm_imagetask(ZkwasmProviderUrl, md5, 'Setup')
                // console.log(res);
                // console.log(res.data.result.data[0]);
            //     setupStatus = res.data.result.data[0].status;
            // } else {
            }
            setupStatus = res.data.result.data[0].status;
            taskId = res.data.result.data[0]._id.$oid;
            if(enableLog) {
                console.log(`[*] IMAGE ALREADY EXISTS. PREVIOUS SETUP TASK ID: ${taskId}`, "\n",
            );
            }
        } else {
            throw error;
        }
    }

    // if (isSetUpSuccess) {



    if(enableLog) {

        const taskStatus = setupStatus === "Done" ? "SUCCESS" : "FAILED";
        console.log(
            `[${taskStatus === "SUCCESS" ? "+" : "-"}] SET UP ${taskStatus}`,
            "\n",
        );

        // Log extra new line before divider.
        console.log();
    }
    // } else {
        // if(enableLog) {
        //     console.log(`[*] IMAGE MD5: ${md5}`, "\n");

        //     // Log status
        //     console.log(`[-] ${errorMessage}`, "\n");
        // }
    // }

    result['md5'] = md5
    result['success'] = setupStatus === "Done" ? true : false;
    result['taskId'] = taskId;
    return result
}


