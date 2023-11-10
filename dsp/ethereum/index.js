import { DataSourcePlugin } from "../interface.js";
import { prepareBlocksByYaml } from "./prepare_blocks.js";
import { fillInputBlocks } from "./fill_blocks.js";

import { providers } from "ethers";
import { getBlock } from "../../common/ethers_helper.js";
import { trimPrefix } from "../../common/utils.js";

export { EthereumDataPrep } from "./blockprep.js";

export class EthereumDataSourcePlugin extends DataSourcePlugin{

  static async prepareData(zkgyaml, prepareParams){
    const { provider, latestBlocknumber, latestBlockhash, expectedStateStr } = prepareParams
    return await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr, zkgyaml)
  }

  static fillExecInput(input, zkgyaml, dataPrep){
    return fillInputBlocks(input, zkgyaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash)
  }

  static fillProveInput(input, zkgyaml, dataPrep){
    this.fillExecInput(input, zkgyaml, dataPrep);
    // add expected State Str
    let expectedStateStr = trimPrefix(dataPrep.expectedStateStr, "0x");
    input.addVarLenHexString(expectedStateStr, true);
    return input;
  }
  
  static toPrepareParams(provider, latestBlocknumber, latestBlockhash, expectedStateStr) {
    return {
      "provider": provider,
      "latestBlocknumber": latestBlocknumber, 
      "latestBlockhash": latestBlockhash,
      "expectedStateStr": expectedStateStr
    }
  }

  static toExecParams(rpcUrl, blockid){
    return {
      "rpcUrl": rpcUrl,
      "blockid": blockid
    }
  }

  static toProveParams(rpcUrl, blockid, expectedStateStr){
    return {
      "rpcUrl": rpcUrl,
      "blockid": blockid,
      "expectedStateStr": expectedStateStr
    }
  }

  static async toPrepareParamsFromExecParams(execParams){
    const { rpcUrl, blockid } = execParams

    const provider = new providers.JsonRpcProvider(rpcUrl);
    
    // Get block
    // TODO: optimize: no need to getblock if blockid is block num
    let rawblock = await getBlock(provider, blockid);
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
    const { rpcUrl, blockid, expectedStateStr } = proveParams

    const provider = new providers.JsonRpcProvider(rpcUrl);
    
    // Get block
    // TODO: optimize: no need to getblock if blockid is block num
    let rawblock = await getBlock(provider, blockid);
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