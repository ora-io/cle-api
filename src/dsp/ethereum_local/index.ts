import { DataSourcePlugin } from '../interface'

// import { providers } from "ethers";
// import { getBlock } from "../../common/ethers_helper.js";
// import { trimPrefix } from "../../common/utils.js";

export class EthereumLocalDataSourcePlugin extends DataSourcePlugin {
  // SHOULD align with zkgraph-lib/dsp/<DSPName>
  static getLibDSPName() { return 'ethereum_local' }
}
