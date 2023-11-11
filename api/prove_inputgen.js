
import { Input } from "../common/input.js";
import { ZkGraphYaml } from "../type/zkgyaml.js";
import { prepareOneBlockByYaml } from "../dsp/ethereum/prepare_blocks.js";
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
  yamlContent,
  proveParams,
  isLocal = false,
  enableLog = true
) {
  // TODO: use isLocal?
  
  // const provider = new providers.JsonRpcProvider(rpcUrl);
  let zkgraphYaml = ZkGraphYaml.fromYamlContent(yamlContent);

  let dsp /**:DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, {'isLocal': isLocal});

  let prepareParams = await dsp.toPrepareParamsFromProveParams(proveParams)
  let dataPrep /**:DataPrep */ = await dsp.prepareData(zkgraphYaml, prepareParams)

  return proveInputGenOnDataPrep(yamlContent, dataPrep, isLocal)
}

export function proveInputGenOnDataPrep(
  yamlContent,
  dataPrep,
  isLocal = false,
) {
  let zkgraphYaml = ZkGraphYaml.fromYamlContent(yamlContent);

  let input = new Input();
  
  let dsp /**:DataSourcePlugin */ = dspHub.getDSPByYaml(zkgraphYaml, {'isLocal': isLocal});

  input = dsp.fillProveInput(input, zkgraphYaml, dataPrep);

  return [input.getPrivateInputStr(), input.getPublicInputStr()];
}
