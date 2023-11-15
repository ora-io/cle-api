import { Input } from "../common/input.js";
import { dspHub } from "../dsp/hub.js";

/**
 * Generate the private and public inputs in hex string format
 * @param {string} yamlContent 
 * @param {object} proveParams {"xx": xx}
 * @param {boolean} isLocal 
 * @param {boolean} enableLog 
 * @returns {[string, string]} - private input string, public input string
 */
export async function proveInputGen(
  zkGraphExecutable,
  proveParams,
  isLocal = false,
  enableLog = true
) {
  const { zkgraphYaml } = zkGraphExecutable;

  let dsp /**:DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, {'isLocal': isLocal});

  let prepareParams = await dsp.toPrepareParamsFromProveParams(proveParams)
  let dataPrep /**:DataPrep */ = await dsp.prepareData(zkgraphYaml, prepareParams)

  return proveInputGenOnDataPrep(zkGraphExecutable, dataPrep, isLocal)
}

export function proveInputGenOnDataPrep(
  zkGraphExecutable,
  dataPrep,
  isLocal = false,
) {
  const { zkgraphYaml } = zkGraphExecutable;

  let input = new Input();
  
  let dsp /**:DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, {'isLocal': isLocal});

  input = dsp.fillProveInput(input, zkgraphYaml, dataPrep);

  return [input.getPrivateInputStr(), input.getPublicInputStr()];
}
