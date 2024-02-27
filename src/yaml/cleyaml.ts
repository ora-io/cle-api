import yaml from 'js-yaml'
import semver from 'semver'
import { YamlHealthCheckFailed, YamlInvalidFormat } from '../common/error'
import { EthereumDataDestination, EthereumDataSource } from './cleyaml_eth'
import type { DataDestination, DataSource, DataSourceKind } from './interface'
import { Mapping, WrappedYaml } from './interface'
import { OffchainDataSource } from './cleyaml_off'

export type DataSourceClassType = 'ethereum' | 'offchain'
export type DataSourceClassMap<T = DataSourceClassType> = Map<T, typeof EthereumDataSource | typeof OffchainDataSource>

const dataSourceClassMap: DataSourceClassMap = new Map()
dataSourceClassMap.set('ethereum', EthereumDataSource)
dataSourceClassMap.set('offchain', OffchainDataSource)

const dataDestinationClassMap = new Map()
dataDestinationClassMap.set('ethereum', EthereumDataDestination)

// class ZkGraphYaml
export class CLEYaml extends WrappedYaml {
  specVersion: string
  apiVersion: string
  description: string
  repository: string
  dataSources: any[]
  dataDestinations: any[]
  mapping: Mapping
  name: string

  constructor(
    yamlObj,
    specVersion: string,
    apiVersion: string,
    name: string,
    description: string,
    repository: any,
    dataSources: any[],
    dataDestinations: any[],
    mapping: Mapping,
  ) {
    super(yamlObj)
    this.specVersion = specVersion
    this.apiVersion = apiVersion
    this.name = name
    this.description = description
    this.repository = repository
    this.dataSources = dataSources
    this.dataDestinations = dataDestinations
    this.mapping = mapping
  }

  static from_v_0_0_2(yamlObj: any) {
    const dataSources: any[] = []
    yamlObj.dataSources.forEach((ds: any) => dataSources.push(dataSourceClassMap.get(ds.kind)?.from_v_0_0_2(ds)))
    const dataDestinations: DataDestination[] = []
    if (yamlObj.dataDestinations !== undefined && yamlObj.dataDestinations !== null && yamlObj.dataDestinations.length !== 0)
      yamlObj.dataDestinations.forEach((dd: { kind: any }) => dataDestinations.push(dataDestinationClassMap.get(dd.kind).from_v_0_0_2(dd)))

    return new CLEYaml(
      yamlObj,
      yamlObj.specVersion,
      yamlObj.apiVersion,
      yamlObj.name,
      yamlObj.description,
      yamlObj.repository,
      dataSources,
      dataDestinations,
      Mapping.from_v_0_0_2(yamlObj.mapping),
    )
  }

  // TODO: type: should be the return class of yaml.load
  static fromYaml(yamlObj: any) {
    // health check before parse
    CLEYaml.healthCheck(yamlObj)
    if (yamlObj.specVersion === '0.0.1')
      return CLEYaml.from_v_0_0_1(yamlObj)

    else if (yamlObj.specVersion === '0.0.2')
      return CLEYaml.from_v_0_0_2(yamlObj)

    else
      throw new Error(`Unsupported specVersion: ${yamlObj.specVersion}`)
  }

  static fromYamlContent(yamlContent: string) {
    try {
      // Parse the YAML content
      const yamlObj = yaml.load(yamlContent)
      return CLEYaml.fromYaml(yamlObj)
    }
    catch (error: any) {
      // TODO: is there other cases than "Invalid Yaml"?
      throw new YamlInvalidFormat(error.message)
    }
  }

  static from_v_0_0_1(_yaml: any): CLEYaml {
    throw new Error('no 0.0.1 support') // TODO
  }

  // // const config = ;
  // sourceType() { //TODO
  //   if (this.specVersion >= "0.0.2"){
  //     if (this.dataSources[0].event) {
  //       return "event";
  //     } else if (this.dataSources[0].storage) {
  //       return "storage";
  //     } else {
  //       throw new Error("At least includes event or storage section in dataSources[0]")
  //     }
  //   } else if (this.specVersion == "0.0.1"){
  //     return "event"; // 0.0.1 only support event
  //   }

  //   throw new Error("Unsupported specVersion: ", this.specVersion)
  // }

  getSignificantKeys(isSource: boolean): string[][] {
    return isSource ? this.dataSources.map((ds: DataSource) => ds.getSignificantKeys()) : this.dataDestinations.map((ds: DataDestination) => ds.getSignificantKeys())
  }

  getFilteredSourcesByKind(kind: DataSourceKind) {
    return this.dataSources.filter((ds: DataSource) => ds.kind === kind) as typeof kind extends 'ethereum' ? EthereumDataSource[] : OffchainDataSource[]
  }

  static healthCheck(yaml: any) {
    // specVersion check
    if (!yaml.specVersion || typeof yaml.specVersion !== 'string' || yaml.specVersion.trim() === '')
      throw new YamlHealthCheckFailed('specVersion is missing or empty')

    if (semver.gt(yaml.specVersion, '0.0.2'))
      throw new YamlHealthCheckFailed('Invalid specVersion, it should be <= 0.0.2')

    // apiVersion → cle-lib version check
    if (!yaml.apiVersion || typeof yaml.apiVersion !== 'string' || yaml.apiVersion.trim() === '')
      throw new YamlHealthCheckFailed('apiVersion is missing or empty')

    if (semver.gt(yaml.apiVersion, '0.0.2'))
      throw new YamlHealthCheckFailed('Invalid apiVersion, it should be <= 0.0.2')

    // datasources can have multiple objects, but should not be empty
    if (!yaml.dataSources || yaml.dataSources.length === 0)
      throw new YamlHealthCheckFailed('dataSources should not be empty')

    const sourceKinds: string[] = []

    yaml.dataSources.forEach((dataSource: { kind: any }) => {
      // every object in datasources MUST have kind
      if (!dataSource.kind)
        throw new YamlHealthCheckFailed('dataSource is missing \'kind\' field')

      sourceKinds.push(dataSource.kind)
    })

    const validKind = ['ethereum', 'offchain']

    // TODO: implement offchain
    if (!sourceKinds.every(kind => validKind.includes(kind)))
      throw new YamlHealthCheckFailed(`Invalid dataSource kind, only support ${validKind.toString()}`)

    // can only have 1 data source with kind 'ethereum' right now
    if (sourceKinds.indexOf('ethereum') + 1 < sourceKinds.lastIndexOf('ethereum'))
      throw new YamlHealthCheckFailed('Only 2 \'ethereum\' kind is allowed in data sources right now')

    yaml.dataSources.forEach((dataSource: any) => {
      // check data sources
      dataSourceClassMap.get(dataSource.kind)?.healthCheck(dataSource)
    })

    // every network field must be the same
    // if (new Set(sourceKinds).size !== 1) {
    //   throw new YamlHealthCheckFailed("All dataSource networks must be the same");
    // }

    // all mapping fields must be not empty
    if (!yaml.mapping.language || !yaml.mapping.file || !yaml.mapping.handler)
      throw new YamlHealthCheckFailed('Some required fields are empty in mapping')

    if (yaml.dataDestinations !== undefined && yaml.dataDestinations !== null && yaml.dataDestinations.length !== 0) {
      yaml.dataDestinations.forEach((dataDest: { kind: any }) => {
        // every object in datasources MUST have kind
        if (!dataDest.kind)
          throw new YamlHealthCheckFailed('dataDestination is missing \'kind\' field')

        // check data destinations
        dataDestinationClassMap.get(dataDest.kind).healthCheck(dataDest)
      })
    }

    // 12. the network must be same as the source network
    // TODO: right now we don't check the block hash, so skip the same network check
    // if (config.dataDestinations[0].network !== sourceNetworks[0]) {
    //   throw new Error("dataDestinations network must match dataSources network");
    // }
  }

  decidePublishNetwork(): string | undefined {
    // 1. if there's ethereum destination use that destination network
    const ddkinds = this.dataDestinations.map((dataDest: { kind: any }) => { return dataDest.kind })
    const ddethidx = ddkinds.indexOf('ethereum')
    if (ddethidx >= 0) {
      return (this.dataDestinations[ddethidx] as EthereumDataDestination).network
    }
    else {
    // 2. if no eth dd, use DS ethereum network
      const dskinds = this.dataSources.map((dataSrc: { kind: any; unsafe?: boolean }) => {
        return dataSrc.kind + (dataSrc.unsafe ? '.unsafe' : '')
      })

      const dsethidx = dskinds.indexOf('ethereum')
      if (dsethidx >= 0) {
        return (this.dataSources[dsethidx] as EthereumDataSource).network
      }
      else {
        // 3. if still nonen then use DS ethereum.unsafe network
        const dsethunsafeidx = dskinds.indexOf('ethereum.unsafe')
        if (dsethunsafeidx >= 0) {
          return (this.dataSources[dsethunsafeidx] as EthereumDataSource).network
        }
        else {
          // 4. else, no network can be used.
          return undefined
        }
      }
    }
  }
}
