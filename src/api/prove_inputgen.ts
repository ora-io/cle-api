import { DSPNotFound } from '../common/error'
import { Input } from '../common/input'
import { dspHub } from '../dsp/hub'
import type { DataPrep } from '../dsp/interface'
import type { ZkGraphExecutable } from '../types/api'

/**
 * Generate the private and public inputs in hex string format
 * @param {string} yamlContent
 * @param {object} proveParams {"xx": xx}
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {[string, string]} - private input string, public input string
 */
export async function proveInputGen(
  zkGraphExecutable: Omit<ZkGraphExecutable, 'wasmUint8Array'>,
  proveParams: Record<string, any>,
  isLocal = false,
) {
  const { cleYaml } = zkGraphExecutable

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml, { isLocal })
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  const prepareParams = await dsp?.toPrepareParams(proveParams, 'prove')
  const dataPrep /** :DataPrep */ = await dsp?.prepareData(cleYaml, prepareParams)

  return proveInputGenOnDataPrep(zkGraphExecutable, dataPrep, isLocal)
}

export function proveInputGenOnDataPrep(
  zkGraphExecutable: Omit<ZkGraphExecutable, 'wasmUint8Array'>,
  dataPrep: DataPrep,
  isLocal = false,
): [string, string] {
  const { cleYaml } = zkGraphExecutable

  let input = new Input()

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(cleYaml, { isLocal })
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  input = dsp.fillProveInput(input, cleYaml, dataPrep)

  return [input.getPrivateInputStr(), input.getPublicInputStr()]
}
