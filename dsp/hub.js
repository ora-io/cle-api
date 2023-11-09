import { EthereumDataSourcePlugin } from "./ethereum";

export const DSPHub = new Map();

function toHubKey(kind, options){
  let { isLocal } = options;
  isLocal = isLocal == null ? false : isLocal
  return `${kind}-${isLocal}`
}

function hubSetDSP(kind, options, dsp) {
  DSPHub.set(toHubKey(kind, options), dsp);
}

export function hubGetDSPByYaml(zkgyaml, options){
  const kind = zkgyaml.dataSources[0].kind;
  return DSPHub.get(toHubKey(kind, options));
}

hubSetDSP('ethereum', false, EthereumDataSourcePlugin);