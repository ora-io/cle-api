import { DataSourcePlugin } from "../interface.js";
import { prepareBlocksByYaml } from "./prepare_blocks.js";
import { fillInputBlocks } from "./fill_blocks.js";

import { providers } from "ethers";
import { getBlock } from "../../common/ethers_helper.js";
import { trimPrefix, dspParamsNormalize } from "../../common/utils.js";

export { EthereumDataPrep } from "./blockprep.js";

export class EthereumDataSourcePlugin extends DataSourcePlugin{
  
  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  static getLibDSPName() {return 'ethereum'}

  static async prepareData(zkgraphYaml, prepareParams){
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams
    let dataPrep = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr, zkgraphYaml)
    return dataPrep;
  }

  static fillExecInput(input, zkgraphYaml, dataPrep){
    return fillInputBlocks(input, zkgraphYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
  }

  static fillProveInput(input, zkgraphYaml, dataPrep){
    this.fillExecInput(input, zkgraphYaml, dataPrep);
    // add expected State Str
    let expectedStateStr = trimPrefix(dataPrep.expectedStateStr, "0x");
    input.addVarLenHexString(expectedStateStr, true);
    return input;
  }

  // TODO: copy instead of rename
  static toProveDataPrep(execDataPrep, execResult){
    let proveDataPrep = execDataPrep;
    proveDataPrep.expectedStateStr = execResult;
    return proveDataPrep
  }

  // validate params exist
  static toPrepareParams(generalParams) {
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = generalParams;
    return {
      "provider": provider,
      "latestBlocknumber": latestBlocknumber, 
      "latestBlockhash": latestBlockhash,
      "expectedStateStr": expectedStateStr
    }
  }

  static execParams = ["jsonRpcUrl", "blockId"]

  // validate params exist // TODO: move to DataSourcePlugin as shared methods?
  static toExecParams(generalParams){
    return dspParamsNormalize(this.execParams, generalParams)
  }

  static proveParams = ["jsonRpcUrl", "blockId", "expectedStateStr"]

  // validate params exist
  static toProveParams(generalParams){
    return dspParamsNormalize(this.proveParams, generalParams)
  }

  static async toPrepareParamsFromExecParams(execParams){
    const { jsonRpcUrl, blockId } = execParams

    const provider = new providers.JsonRpcProvider(jsonRpcUrl);
    
    // Get block
    // TODO: optimize: no need to getblock if blockId is block num
    let rawblock = await getBlock(provider, blockId);
    const blockNumber = parseInt(rawblock.number);
    const blockHash = rawblock.hash;
    
    return {
      "provider": provider,
      "latestBlocknumber": blockNumber, 
      "latestBlockhash": blockHash,
      "expectedStateStr": null
    }
  }

  static async toPrepareParamsFromProveParams(proveParams){
    const { jsonRpcUrl, blockId, expectedStateStr } = proveParams

    const provider = new providers.JsonRpcProvider(jsonRpcUrl);
    
    // Get block
    // TODO: optimize: no need to getblock if blockId is block num
    let rawblock = await getBlock(provider, blockId);
    const blockNumber = parseInt(rawblock.number);
    const blockHash = rawblock.hash;
    
    return {
      "provider": provider,
      "latestBlocknumber": blockNumber, 
      "latestBlockhash": blockHash,
      "expectedStateStr": expectedStateStr
    }
  }
}
