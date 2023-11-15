import { EthereumDataSourcePlugin } from "./ethereum/index.js";
import { EthereumLocalDataSourcePlugin } from "./ethereum_local/index.js";

// export const DSPHub = new Map();

// function toHubKey(primaryKey, foreignKeys){
//   let { isLocal } = foreignKeys;
//   isLocal = isLocal == null ? false : isLocal
//   return `${primaryKey}-${isLocal}`
// }

// function hubSetDSP(primaryKey, foreignKeys, dsp) {
//   DSPHub.set(toHubKey(primaryKey, foreignKeys), dsp);
// }

// export function hubGetDSPByYaml(zkgraphYaml, foreignKeys){
//   const primaryKey = zkgraphYaml.dataSources[0].primaryKey;
//   return DSPHub.get(toHubKey(primaryKey, foreignKeys));
// }

// hubSetDSP('ethereum', false, EthereumDataSourcePlugin);


export class DSPHub{
  hub = new Map();

  /**
   * @param {string} primaryKey yaml.dataSources[i].kind
   * @param {object} foreignKeys {"isLocal": boolean}
   * @returns Combined Key String: Better to be human readable
   */
  toHubKey(primaryKey, foreignKeys){
    let { isLocal } = foreignKeys;
    let keyFullLocal = (! isLocal || isLocal == null) ? 'full' : 'local'
    return `${primaryKey}-${keyFullLocal}`
  }

  toHubKeyByYaml(zkgraphYaml, foreignKeys){
    let primaryKey = zkgraphYaml.dataSources[0].kind;
    return this.toHubKey(primaryKey, foreignKeys);
  }

  setDSP(primaryKey, foreignKeys, dsp) {
    this.hub.set(this.toHubKey(primaryKey, foreignKeys), dsp);
  }

  getDSP(primaryKey, foreignKeys){
    let key = this.toHubKey(primaryKey, foreignKeys)
    if (!this.hub.has(key)) {
      throw new Error(`Data Source Plugin Hub Key "${key}" doesn't exist.`)
    }
    return this.hub.get(key);
  }

  getDSPByYaml(zkgraphYaml, foreignKeys){
    const primaryKey = zkgraphYaml.dataSources[0].kind;
    return this.getDSP(primaryKey, foreignKeys);
  }
}

/**
 * Global DSP Hub
 */
export const dspHub = new DSPHub();

/**
 * Register DSPs
 */
dspHub.setDSP('ethereum', {'isLocal': false}, EthereumDataSourcePlugin);
dspHub.setDSP('ethereum', {'isLocal': true}, EthereumLocalDataSourcePlugin);