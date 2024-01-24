import { Simulator } from '@hyperoracle/zkwasm-toolchain/zkwasmmock/simulator.js'
import { instantiateWasm, setupZKWasmSimulator } from '@hyperoracle/zkwasm-toolchain/zkwasmmock/bundle.js'
import { CLERequireFailed } from '../common/error'
import type { CLEExecutable } from '../types/api'

/**
 * Mock the zkwasm proving process for pre-test purpose.
 * @param {object} cleExecutable
 * @param {string} privateInputStr
 * @param {string} publicInputStr
 * @returns {boolean} - the mock testing result
 */
export async function proveMock(cleExecutable: Omit<CLEExecutable, 'cleYaml'>, privateInputStr: string, publicInputStr: string) {
  const { wasmUint8Array } = cleExecutable

  const mock = new Simulator()
  mock.set_private_input(privateInputStr)
  mock.set_public_input(publicInputStr)
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
