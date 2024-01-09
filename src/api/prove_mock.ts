import { ZKWASMMock } from '../common/zkwasm_mock'
import { instantiateWasm, setupZKWasmMock } from '../common/bundle'
import { ZKGraphRequireFailed } from '../common/error'
import type { ZkGraphExecutable } from '../types/api'

/**
 * Mock the zkwasm proving process for pre-test purpose.
 * @param {object} zkGraphExecutable
 * @param {string} privateInputStr
 * @param {string} publicInputStr
 * @returns {boolean} - the mock testing result
 */
export async function proveMock(zkGraphExecutable: Omit<ZkGraphExecutable, 'cleYaml'>, privateInputStr: string, publicInputStr: string) {
  const { wasmUint8Array } = zkGraphExecutable

  const mock = new ZKWASMMock()
  mock.set_private_input(privateInputStr)
  mock.set_public_input(publicInputStr)
  setupZKWasmMock(mock)

  const { zkmain } = await instantiateWasm(wasmUint8Array).catch((error) => {
    throw error
  })

  try {
    zkmain()
  }
  catch (e) {
    if (e instanceof ZKGraphRequireFailed)
      return false

    throw e
  }

  // if (enableLog){
  //     console.log("[+] ZKWASM MOCK EXECUTION SUCCESS!", "\n");
  // }

  return true
}
