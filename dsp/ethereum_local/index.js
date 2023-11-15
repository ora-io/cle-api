import { DataSourcePlugin } from "../interface.js";

// import { providers } from "ethers";
// import { getBlock } from "../../common/ethers_helper.js";
// import { trimPrefix } from "../../common/utils.js";

export class EthereumLocalDataSourcePlugin extends DataSourcePlugin{
  
  // SHOULD align with zkgraph-lib/dsp/ethereum_local/index.ts
  static getLibFuncNames() {return ['zkmain_ethereum_local', 'asmain_ethereum_local']}
}