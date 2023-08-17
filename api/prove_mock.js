import { proveInputGen } from "../api/prove_inputgen.js"
import { ZKWASMMock } from "../common/zkwasm_mock.js";
import { instantiateWasm, setupZKWasmMock } from "../common/bundle.js";
import { ZKGraphRequireFailed } from "../common/error.js";

/**
 * Mock the zkwasm proving process for pre-test purpose.
 * @param {string} yamlPath 
 * @param {string} rpcUrl 
 * @param {number | string} blockid 
 * @param {string} expectedStateStr 
 * @param {boolean} isLocal 
 * @param {boolean} enableLog 
 * @returns {boolean} - the mock testing result
 */
export async function proveMock(basePath, wasmPath, privateInputStr, publicInputStr) {
    // let [privateInputStr, publicInputStr] = await proveInputGen(yamlPath, rpcUrl, blockid, expectedStateStr, isLocal, enableLog)
    const mock = new ZKWASMMock();
    mock.set_private_input(privateInputStr);
    mock.set_public_input(publicInputStr);
    setupZKWasmMock(mock);

    const { zkmain } = await instantiateWasm(wasmPath, basePath);

    try {
        zkmain(); 
    } catch (e){
        if (e instanceof ZKGraphRequireFailed){
            return false
        }
        throw e
    }

    // if (enableLog){
    //     console.log("[+] ZKWASM MOCK EXECUTION SUCCESS!", "\n");
    // }

    return true
}