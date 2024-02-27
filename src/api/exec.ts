import { Input, Simulator, instantiateWasm, setupZKWasmSimulator } from 'zkwasm-toolchain'
// import { instantiateWasm, setupZKWasmMock } from '../common/bundle'

import { DSPNotFound } from '../common/error'
import { dspHub } from '../dsp/hub'
import type { DataPrep } from '../dsp/interface'
import type { CLEExecutable } from '../types'
export { hasDebugOnlyFunc } from 'zkwasm-toolchain'

/**
 * Execute the given cleExecutable in the context of execParams
 * @param {object} cleExecutable {'cleYaml': cleYaml}
 * @param {object} execParams
 * @returns {Uint8Array} - execution result (aka. CLE state)
 */
export async function execute(cleExecutable: CLEExecutable, execParams: Record<string, any>): Promise<Uint8Array> {
  const { cleYaml } = cleExecutable

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml)
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  const prepareParams = await dsp?.toPrepareParams(execParams, 'exec')
  const dataPrep /** :DataPrep */ = await dsp?.prepareData(cleYaml, prepareParams) as DataPrep

  return await executeOnDataPrep(cleExecutable, dataPrep)
}

/**
 *
 * @param {object} cleExecutable
 * @param {DataPrep} dataPrep
 * @returns
 */
export async function executeOnDataPrep(cleExecutable: CLEExecutable, dataPrep: DataPrep): Promise<Uint8Array> {
  const { cleYaml } = cleExecutable

  let input = new Input()

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml)
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  input = dsp.fillExecInput(input, cleYaml, dataPrep)

  return await executeOnInputs(cleExecutable, input)
}

/**
 *
 * @param {object} cleExecutable
 * @param {string} privateInputStr
 * @param {string} publicInputStr
 * @returns
 */
export async function executeOnInputs(cleExecutable: CLEExecutable, input: Input): Promise<Uint8Array> {
  // console.log('executeOnInputs input:', input.auxParams)

  const { wasmUint8Array } = cleExecutable
  if (!wasmUint8Array)
    throw new Error('wasmUint8Array is null')
  const mock = new Simulator(100000000, 2000)
  mock.set_private_input(input.getPrivateInputStr())
  mock.set_public_input(input.getPublicInputStr())
  mock.set_context_input(input.getContextInputStr())
  setupZKWasmSimulator(mock)

  const { asmain } = await instantiateWasm(wasmUint8Array).catch((error: any) => {
    throw error
  })

  let stateU8a
  // eslint-disable-next-line no-useless-catch
  try {
    stateU8a = asmain()
  }
  catch (e) {
    throw e
  }
  return stateU8a as Uint8Array
}
