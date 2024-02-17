import { Input } from 'zkwasm-toolchain'
import { DSPNotFound } from '../common/error'
import { dspHub } from '../dsp/hub'
import type { DataPrep } from '../dsp/interface'
import type { CLEExecutable } from '../types/api'

/**
 * Generate the private and public inputs in hex string format
 * @param {object} cleExecutable
 * @param {object} proveParams {"xx": xx}
 * @returns {[string, string]} - private input string, public input string
 */
export async function proveInputGen(
  cleExecutable: Omit<CLEExecutable, 'wasmUint8Array'>,
  proveParams: Record<string, any>,
) {
  const { cleYaml } = cleExecutable

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml)
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  const prepareParams = await dsp?.toPrepareParams(proveParams, 'prove')
  const dataPrep /** :DataPrep */ = await dsp?.prepareData(cleYaml, prepareParams) as DataPrep

  return proveInputGenOnDataPrep(cleExecutable, dataPrep)
}

export function proveInputGenOnDataPrep(
  cleExecutable: Omit<CLEExecutable, 'wasmUint8Array'>,
  dataPrep: DataPrep,
): Input {
  const { cleYaml } = cleExecutable

  let input = new Input()

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml)
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  input = dsp.fillProveInput(input, cleYaml, dataPrep)

  // return [input.getPrivateInputStr(), input.getPublicInputStr()]
  return input
}
