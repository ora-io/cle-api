import { Simulator, instantiateWasm, setupZKWasmSimulator } from '@ora-io/zkwasm-toolchain'
import { CLERequireFailed } from '../common/error'
import type { CLEExecutable } from '../types/api'
import type { Input } from '../common'

/**
 * Mock the zkwasm proving process for pre-test purpose.
 * @param {object} cleExecutable
 * @param {string} privateInputStr
 * @param {string} publicInputStr
 * @returns {boolean} - the mock testing result
 */
export async function proveMock(cleExecutable: Omit<CLEExecutable, 'cleYaml'>, input: Input) {
  const { wasmUint8Array } = cleExecutable

  const mock = new Simulator()
  mock.set_private_input(input.getPrivateInputStr())
  mock.set_public_input(input.getPublicInputStr())
  setupZKWasmSimulator(mock)

  const { zkmain } = await instantiateWasm(wasmUint8Array).catch((error: any) => {
    throw error
  })

  try {
    zkmain()
  }
  catch (e) {
    if (e instanceof CLERequireFailed)
      return false

    throw e
  }

  // if (enableLog){
  //     console.log("[+] ZKWASM MOCK EXECUTION SUCCESS!", "\n");
  // }

  return true
}
