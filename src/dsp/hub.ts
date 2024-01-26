import type { CLEYaml } from '../types/zkgyaml'
import { EthereumDataSourcePlugin } from './ethereum'
import { EthereumOffchainDSP } from './ethereum-offchain.bytes'
import { EthereumUnsafeDataSourcePlugin } from './ethereum.unsafe'
import type { DataSourcePlugin } from './interface'
import { UnsafeSafeETHDSP } from './ethereum.unsafe-ethereum'

// export const DSPHub = new Map();

// function toHubKey(primaryKey, foreignKeys){
//   let { isLocal } = foreignKeys;
//   isLocal = isLocal == null ? false : isLocal
//   return `${primaryKey}-${isLocal}`
// }

// function hubSetDSP(primaryKey, foreignKeys, dsp) {
//   DSPHub.set(toHubKey(primaryKey, foreignKeys), dsp);
// }

// export function hubGetDSPByYaml(cleYaml, foreignKeys){
//   const primaryKey = cleYaml.dataSources[0].primaryKey;
//   return DSPHub.get(toHubKey(primaryKey, foreignKeys));
// }

// hubSetDSP('ethereum', false, EthereumDataSourcePlugin);

export interface DSPHubForeignKeys {
  isLocal?: boolean
}

export class DSPHub {
  hub = new Map<string, InstanceType<typeof DataSourcePlugin>>()

  /**
   * @param {string} primaryKey yaml.dataSources[i].kind
   * @param {object} foreignKeys {"isLocal": boolean}
   * @returns Combined Key String: Better to be human readable
   */
  toHubKey(primaryKey: string, foreignKeys: DSPHubForeignKeys) {
    const { isLocal } = foreignKeys
    const keyFullLocal = (!isLocal || isLocal == null) ? 'full' : 'local'
    return `${primaryKey}:${keyFullLocal}`
  }

  toHubKeyByYaml(cleYaml: CLEYaml, foreignKeys: DSPHubForeignKeys) {
    const sigKeys = cleYaml.getSignificantKeys(true)
    const primaryKey = this.toPrimaryKey(sigKeys)
    return this.toHubKey(primaryKey, foreignKeys)
  }

  toPrimaryKey(sigKeys: any[]) {
    return sigKeys.map((keys: any[]) => keys.join('.')).join('-')
  }

  setDSP(primaryKey: string, foreignKeys: DSPHubForeignKeys, dsp: InstanceType<typeof DataSourcePlugin<any, any, any, any>>) {
    this.hub.set(this.toHubKey(primaryKey, foreignKeys), dsp)
  }

  getDSP(primaryKey: string, foreignKeys: DSPHubForeignKeys): InstanceType<typeof DataSourcePlugin> | undefined {
    const key = this.toHubKey(primaryKey, foreignKeys)
    if (!this.hub.has(key))
      throw new Error(`Data Source Plugin Hub Key "${key}" doesn't exist.`)

    return this.hub.get(key)
  }

  getDSPByYaml(cleYaml: CLEYaml, foreignKeys: DSPHubForeignKeys) {
    const sigKeys = cleYaml.getSignificantKeys(true)
    const primaryKey = this.toPrimaryKey(sigKeys) as any
    return this.getDSP(primaryKey, foreignKeys)
  }
}

/**
 * Global DSP Hub
 */
export const dspHub = new DSPHub()

/**
 * Register DSPs
 */
dspHub.setDSP('ethereum', { isLocal: false }, new EthereumDataSourcePlugin())
dspHub.setDSP('ethereum-offchain.bytes', { isLocal: false }, new EthereumOffchainDSP())

// compatible purpose, deprecating
// dspHub.setDSP('ethereum', { isLocal: true }, new EthereumLocalDataSourcePlugin())

dspHub.setDSP('ethereum.unsafe', { isLocal: false }, new EthereumUnsafeDataSourcePlugin())
dspHub.setDSP('ethereum.unsafe-ethereum', { isLocal: false }, new UnsafeSafeETHDSP())
