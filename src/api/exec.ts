import { instantiateWasm, setupZKWasmSimulator } from '@hyperoracle/zkwasm-toolchain/zkwasmmock/bundle.js'
import { Simulator } from '@hyperoracle/zkwasm-toolchain/zkwasmmock/simulator.js'
import { DSPNotFound } from '../common/error'
import { Input } from '../common/input'
import { dspHub } from '../dsp/hub'
import type { DataPrep } from '../dsp/interface'
import type { CLEExecutable } from '../types/api'

/**
 * Execute the given cleExecutable in the context of execParams
 * @param {object} cleExecutable {'cleYaml': cleYaml}
 * @param {object} execParams
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {Uint8Array} - execution result (aka. CLE state)
 */
export async function execute(cleExecutable: CLEExecutable, execParams: Record<string, any>, isLocal = false) {
  const { cleYaml } = cleExecutable

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml, { isLocal })
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  const prepareParams = await dsp?.toPrepareParams(execParams, 'exec')
  const dataPrep /** :DataPrep */ = await dsp?.prepareData(cleYaml, prepareParams)

  return await executeOnDataPrep(cleExecutable, dataPrep, isLocal)
}

/**
 *
 * @param {object} cleExecutable
 * @param {DataPrep} dataPrep
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns
 */
export async function executeOnDataPrep(cleExecutable: CLEExecutable, dataPrep: DataPrep, isLocal = false) {
  const { cleYaml } = cleExecutable

  let input = new Input()

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml, { isLocal })
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  input = dsp.fillExecInput(input, cleYaml, dataPrep)

  const [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()]

  return await executeOnInputs(cleExecutable, privateInputStr, publicInputStr)
}

/**
 *
 * @param {object} cleExecutable
 * @param {string} privateInputStr
 * @param {string} publicInputStr
 * @returns
 */
export async function executeOnInputs(cleExecutable: CLEExecutable, privateInputStr: string, publicInputStr: string) {
  const { wasmUint8Array } = cleExecutable
  if (!wasmUint8Array)
    throw new Error('wasmUint8Array is null')

  const mock = new Simulator(100000000, 2000)
  mock.set_private_input(privateInputStr)
  mock.set_public_input(publicInputStr)
  setupZKWasmSimulator(mock)

  const { asmain } = await instantiateWasm(wasmUint8Array).catch((error) => {
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
