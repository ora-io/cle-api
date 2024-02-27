import type { CLEYaml } from '../types'
import { EthereumDataDestinationPlugin } from './ethereum'
import type { DataDestinationPlugin } from './interface'

export interface DDPHubForeignKeys {
  // isLocal?: boolean
}

export class DDPHub {
  hub: Map<string, InstanceType<typeof DataDestinationPlugin>>

  constructor() {
    this.hub = new Map<string, InstanceType<typeof DataDestinationPlugin>>()
  }

  /**
   * @param {string} primaryKey yaml.dataSources[i].kind
   * @param {object} foreignKeys e.g. {"key": value}
   * @returns Combined Key String: Better to be human readable
   */
  toHubKey(primaryKey: string, _foreignKeys: DDPHubForeignKeys) {
    return primaryKey
    // const { isLocal } = foreignKeys
    // const keyFullLocal = (!isLocal || isLocal == null) ? 'full' : 'local'
    // return `${primaryKey}:${keyFullLocal}`
  }

  toPrimaryKey(sigKeys: string[]): string {
    return sigKeys.join('.')
  }

  // diff from DSPHub
  // toHubKeyList(sigKeysList: any[][], foreignKeys: DDPHubForeignKeys): string[] {
  //   return sigKeysList.map(sigKeys => {
  //     let primaryKey = this.toPrimaryKey(sigKeys)
  //     return this.toHubKey(primaryKey, foreignKeys)
  //   });
  // }

  // diff from DSPHub
  toPrimaryKeyList(sigKeysList: any[][], _foreignKeys: DDPHubForeignKeys): string[] {
    return sigKeysList.map((sigKeys) => {
      return this.toPrimaryKey(sigKeys)
    })
  }

  toHubKeyListByYaml(cleYaml: CLEYaml, foreignKeys: DDPHubForeignKeys): string[] {
    const sigKeysList = cleYaml.getSignificantKeys(false)
    const primaryKeyList = this.toPrimaryKeyList(sigKeysList, foreignKeys)
    return primaryKeyList.map((primaryKey) => {
      return this.toHubKey(primaryKey, foreignKeys)
    })
  }

  setDDP(primaryKey: string, foreignKeys: DDPHubForeignKeys, ddp: InstanceType<typeof DataDestinationPlugin<any>>) {
    this.hub.set(this.toHubKey(primaryKey, foreignKeys), ddp)
  }

  getDDP(primaryKey: string, foreignKeys: DDPHubForeignKeys): InstanceType<typeof DataDestinationPlugin> {
    const key = this.toHubKey(primaryKey, foreignKeys)
    if (!this.hub.has(key))
      throw new Error(`Data Destination Plugin Hub Key "${key}" doesn't exist.`)
    const ddp = this.hub.get(key)
    if (ddp === undefined)
      throw new Error('Impossible')
    return ddp
  }

  getDDPsByYaml(cleYaml: CLEYaml, foreignKeys: DDPHubForeignKeys = {}): InstanceType<typeof DataDestinationPlugin>[] {
    const sigKeysList = cleYaml.getSignificantKeys(true)
    const primaryKeyList = this.toPrimaryKeyList(sigKeysList, foreignKeys)
    return primaryKeyList.map((primaryKey) => {
      const ddp = this.getDDP(primaryKey, foreignKeys)
      return ddp
    })
  }

  initialize(): void {
    /**
     * Register DDPs
     */
    this.setDDP('ethereum', {}, new EthereumDataDestinationPlugin())
  }
}

/**
 * Global DDP Hub
 */
export const ddpHub = new DDPHub()
ddpHub.initialize()
