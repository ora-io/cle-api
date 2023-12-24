import yaml from 'js-yaml'
import semver from 'semver'
import { YamlHealthCheckFailed, YamlInvalidFormat } from '../common/error'
import { EthereumDataDestination, EthereumDataSource } from './zkgyaml_eth'
import type { DataDestination, DataSource, DataSourceKind } from './zkgyaml_def'
import { Mapping } from './zkgyaml_def'
import { OffchainDataSource } from './zkgyaml_off'

export type DataSourceClassType = 'ethereum' | 'offchain'
export type DataSourceClassMap<T = DataSourceClassType> = Map<T, typeof EthereumDataSource | typeof OffchainDataSource>

const dataSourceClassMap: DataSourceClassMap = new Map()
dataSourceClassMap.set('ethereum', EthereumDataSource)
dataSourceClassMap.set('offchain', OffchainDataSource)

const dataDestinationClassMap = new Map()
dataDestinationClassMap.set('ethereum', EthereumDataDestination)

export class ZkGraphYaml {
  specVersion: string
  apiVersion: string
  description: string
  repository: string
  dataSources: any[]
  dataDestinations: any[]
  mapping: Mapping
  name: string

  constructor(
    specVersion: string,
    apiVersion: string,
    name: string,
    description: string,
    repository: any,
    dataSources: any[],
    dataDestinations: any[],
    mapping: Mapping,
  ) {
    this.specVersion = specVersion
    this.apiVersion = apiVersion
    this.name = name
    this.description = description
    this.repository = repository
    this.dataSources = dataSources
    this.dataDestinations = dataDestinations
    this.mapping = mapping
  }

  static from_v_0_0_2(yaml: any) {
    const dataSources: any[] = []
    yaml.dataSources.forEach((ds: any) => dataSources.push(dataSourceClassMap.get(ds.kind)?.from_v_0_0_2(ds)))
    const dataDestinations: DataDestination[] = []
    if (yaml.dataDestinations !== undefined && yaml.dataDestinations !== null && yaml.dataDestination.length !== 0)
      yaml.dataDestinations.forEach((dd: { kind: any }) => dataDestinations.push(dataDestinationClassMap.get(dd.kind).from_v_0_0_2(dd)))

    return new ZkGraphYaml(
      yaml.specVersion,
      yaml.apiVersion,
      yaml.name,
      yaml.description,
      yaml.repository,
      dataSources,
      dataDestinations,
      Mapping.from_v_0_0_2(yaml.mapping),
    )
  }

  // TODO: type: should be the return class of yaml.load
  static fromYaml(yaml: any) {
    // health check before parse
    ZkGraphYaml.healthCheck(yaml)
    if (yaml.specVersion === '0.0.1')
      return ZkGraphYaml.from_v_0_0_1(yaml)

    else if (yaml.specVersion === '0.0.2')
      return ZkGraphYaml.from_v_0_0_2(yaml)

    else
      throw new Error(`Unsupported specVersion: ${yaml.specVersion}`)
  }

  static fromYamlContent(yamlContent: string) {
    try {
      // Parse the YAML content
      const config = yaml.load(yamlContent)
      return ZkGraphYaml.fromYaml(config)
    }
    catch (error: any) {
      // TODO: is there other cases than "Invalid Yaml"?
      throw new YamlInvalidFormat(error.message)
    }
  }

  static from_v_0_0_1(_yaml: any): ZkGraphYaml {
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

  getSignificantKeys(isSource: boolean) {
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

    // apiVersion → zkgraph-lib version check
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
    if (sourceKinds.indexOf('ethereum') !== sourceKinds.lastIndexOf('ethereum'))
      throw new YamlHealthCheckFailed('Only 1 \'ethereum\' kind is allowed in data sources right now')

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
}
