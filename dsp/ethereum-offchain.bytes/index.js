import { DataPrep, DataSourcePlugin } from "../interface.js";

// reuse ethereum dsp for blocks
import { prepareBlocksByYaml } from "../ethereum/prepare_blocks.js";
import { fillInputBlocks } from "../ethereum/fill_blocks.js";

import { providers } from "ethers";
import { getBlock } from "../../common/ethers_helper.js";
import { dspParamsNormalize, trimPrefix } from "../../common/utils.js";

export class EthereumOffchainDP extends DataPrep {
  constructor(blockPrepMap, blocknumberOrder, latestBlockhash, offchainData, expectedStateStr) {
    super();
    this.blockPrepMap = blockPrepMap;
    this.blocknumberOrder = blocknumberOrder;
    this.latestBlockhash = latestBlockhash;
    this.offchainData = offchainData;
    this.expectedStateStr = expectedStateStr;
  }
}

export class EthereumOffchainDSP extends DataSourcePlugin{
  
  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  static getLibDSPName() {return 'ethereum-offchain.bytes'}

  static async prepareData(zkgraphYaml, prepareParams){
    const { provider, latestBlocknumber, latestBlockhash, offchainData, expectedStateStr } = prepareParams
    let ethDP = await prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr, zkgraphYaml)
    return new EthereumOffchainDP(
      ethDP.blockPrepMap,
      ethDP.blocknumberOrder,
      ethDP.latestBlockhash,
      // add offchain data
      offchainData,
      ethDP.expectedStateStr,
    )
  }

  static fillExecInput(input, zkgraphYaml, dataPrep){
    input = fillInputBlocks(input, zkgraphYaml, dataPrep.blockPrepMap, dataPrep.blocknumberOrder, dataPrep.latestBlockhash);
    // add offchain data
    input.addVarLenHexString(dataPrep.offchainData);
    return input
  }

  static fillProveInput(input, zkgraphYaml, dataPrep){
    this.fillExecInput(input, zkgraphYaml, dataPrep);
    // add offchain data
    input.addVarLenHexString(dataPrep.offchainData);
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
  
  static toPrepareParams(generalParams) {
    const { provider, latestBlocknumber, latestBlockhash, offchainData, expectedStateStr } = generalParams
    return {
      "provider": provider,
      "latestBlocknumber": latestBlocknumber, 
      "latestBlockhash": latestBlockhash,
      // add offchain data
      "offchainData": offchainData,
      "expectedStateStr": expectedStateStr
    }
  }

  static execParams = ["jsonRpcUrl", "blockId", "offchainData"]

  static toExecParams(generalParams){
    return dspParamsNormalize(this.execParams, generalParams)
  }

  static proveParams = ["jsonRpcUrl", "blockId", "offchainData", "expectedStateStr"]

  static toProveParams(generalParams){
    return dspParamsNormalize(this.proveParams, generalParams)
  }

  static async toPrepareParamsFromExecParams(execParams){
    const { jsonRpcUrl, blockId, offchainData } = execParams

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
      // add offchain data
      "offchainData": offchainData,
      "expectedStateStr": null
    }
  }

  static async toPrepareParamsFromProveParams(proveParams){
    const { jsonRpcUrl, blockId, offchainData, expectedStateStr } = proveParams

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
      // add offchain data
      "offchainData": offchainData,
      "expectedStateStr": expectedStateStr
    }
  }
}
