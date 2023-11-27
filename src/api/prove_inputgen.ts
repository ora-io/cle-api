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
  zkGraphExecutable: ZkGraphExecutable,
  proveParams: Record<string, any>,
  isLocal = false,
  _enableLog = true,
) {
  const { zkgraphYaml } = zkGraphExecutable

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, { isLocal })

  const prepareParams = await dsp.toPrepareParamsFromProveParams(proveParams)
  const dataPrep /** :DataPrep */ = await dsp.prepareData(zkgraphYaml, prepareParams)

  return proveInputGenOnDataPrep(zkGraphExecutable, dataPrep, isLocal)
}

export function proveInputGenOnDataPrep(
  zkGraphExecutable: ZkGraphExecutable,
  dataPrep: DataPrep,
  isLocal = false,
): [string, string] {
  const { zkgraphYaml } = zkGraphExecutable

  let input = new Input()

  const dsp /** :DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, { isLocal })

  input = dsp.fillProveInput(input, zkgraphYaml, dataPrep)

  return [input.getPrivateInputStr(), input.getPublicInputStr()]
}
