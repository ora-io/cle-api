import type { Input } from 'zkwasm-toolchain'
import { Simulator, instantiateWasm, setupZKWasmSimulator } from 'zkwasm-toolchain'
import { CLERequireFailed } from '../common/error'
import type { CLEExecutable } from '../types/api'

/**
 * Mock the zkwasm proving process for pre-test purpose.
 * @param {object} cleExecutable
 * @param {Input} input
 * @returns {boolean} - the mock testing result
 */
export async function proveMock(
  cleExecutable: Omit<CLEExecutable, 'cleYaml'>,
  input: Input,
): Promise<boolean> {
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

  return true
}
