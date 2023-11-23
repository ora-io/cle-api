import yaml from "js-yaml";
import semver from "semver";
import fs from 'fs'
import { YamlHealthCheckFailed } from "../common/error.js";
import { EthereumDataDestination, EthereumDataSource } from "./zkgyaml_eth.js";
import { Mapping } from "./zkgyaml_def.js";
import { OffchainDataSource } from "./zkgyaml_off.js";

const dataSourceClassMap = new Map();
dataSourceClassMap.set('ethereum', EthereumDataSource)
dataSourceClassMap.set('offchain', OffchainDataSource)

const dataDestinationClassMap = new Map();
dataDestinationClassMap.set('ethereum', EthereumDataDestination)

export class ZkGraphYaml {
  constructor(specVersion, apiVersion, name, description, repository, dataSources, dataDestinations, mapping) {
    this.specVersion = specVersion;
    this.apiVersion = apiVersion;
    this.name = name;
    this.description = description;
    this.repository = repository;
    this.dataSources = dataSources;
    this.dataDestinations = dataDestinations;
    this.mapping = mapping;
  }
  static from_v_0_0_2(yaml) {
    const dataSources = [];
    yaml.dataSources.forEach(ds => dataSources.push(dataSourceClassMap.get(ds.kind).from_v_0_0_2(ds)));
    const dataDestinations = [];
    yaml.dataDestinations.forEach(dd => dataDestinations.push(dataDestinationClassMap.get(dd.kind).from_v_0_0_2(dd)));

    return new ZkGraphYaml(
      yaml.specVersion,
      yaml.apiVersion,
      yaml.name,
      yaml.description,
      yaml.repository,
      dataSources,
      dataDestinations,
      Mapping.from_v_0_0_2(yaml.mapping)
    )
  }

  static fromYaml(yaml) {
    // health check before parse
    ZkGraphYaml.healthCheck(yaml);
    if (yaml.specVersion == "0.0.1"){
      return ZkGraphYaml.from_v_0_0_1(yaml)
    } else if (yaml.specVersion == "0.0.2") {
      return ZkGraphYaml.from_v_0_0_2(yaml)
    } else {
      throw new Error("Unsupported specVersion: ", ttt.specVersion)
    }
  }

  static fromYamlContent(yamlContent) {
    let config;
    try {
      // Parse the YAML content
      config = yaml.load(yamlContent);
    } catch (error) {
      console.error(error);
    }
    return ZkGraphYaml.fromYaml(config)
  }

  static fromYamlPath(yamlPath) {
    if(!__BROWSER__) {
      let fileContents;
      try {
        // Read the YAML file contents
        fileContents = fs.readFileSync(yamlPath, "utf8");
      } catch (error) {
        console.error(error);
      }
      return ZkGraphYaml.fromYamlContent(fileContents)
    }

  }

  static from_v_0_0_1(yaml) {
    throw new Error('no 0.0.1 support'); //TODO
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

  getSignificantKeys(isSource){
    return isSource ? this.dataSources.map(ds => ds.getSignificantKeys()) : this.dataDestinations.map(ds => ds.getSignificantKeys())
  }

  getFilteredSourcesByKind(kind){
    return this.dataSources.filter(ds => ds.kind === kind)
  }

  static healthCheck(yaml) {

    // specVersion check
    if (!yaml.specVersion || typeof yaml.specVersion !== 'string' || yaml.specVersion.trim() === '') {
      throw new YamlHealthCheckFailed("specVersion is missing or empty");
    }

    if (semver.gt(yaml.specVersion, '0.0.2')) {
      throw new YamlHealthCheckFailed("Invalid specVersion, it should be <= 0.0.2");
    }

    // apiVersion → zkgraph-lib version check
    if (!yaml.apiVersion || typeof yaml.apiVersion !== 'string' || yaml.apiVersion.trim() === '') {
      throw new YamlHealthCheckFailed("apiVersion is missing or empty");
    }

    if (semver.gt(yaml.apiVersion, '0.0.2')) {
      throw new YamlHealthCheckFailed("Invalid apiVersion, it should be <= 0.0.2");
    }

    // datasources can have multiple objects, but should not be empty
    if (!yaml.dataSources || yaml.dataSources.length === 0) {
      throw new YamlHealthCheckFailed("dataSources should not be empty");
    }

    const sourceKinds = [];

    yaml.dataSources.forEach(dataSource => {
      // every object in datasources MUST have kind
      if (!dataSource.kind) {
        throw new YamlHealthCheckFailed("dataSource is missing 'kind' field");
      }
      sourceKinds.push(dataSource.kind);
    });

    const validKind = ['ethereum', 'offchain']

    //TODO: implement offchain
    if (!sourceKinds.every((kind) => validKind.includes(kind) )){
      throw new YamlHealthCheckFailed("Invalid dataSource kind, only support " + validKind.toString());
    }

    // can only have 1 data source with kind 'ethereum' right now
    if (sourceKinds.indexOf('ethereum') != sourceKinds.lastIndexOf('ethereum')){
      throw new YamlHealthCheckFailed("Only 1 'ethereum' kind is allowed in data sources right now");
    }

    yaml.dataSources.forEach(dataSource => {
     // check data sources
     dataSourceClassMap.get(dataSource.kind).healthCheck(dataSource);
    });

    // every network field must be the same
    // if (new Set(sourceKinds).size !== 1) {
    //   throw new YamlHealthCheckFailed("All dataSource networks must be the same");
    // }


    // all mapping fields must be not empty
    if (!yaml.mapping.language || !yaml.mapping.file || !yaml.mapping.handler) {
      throw new YamlHealthCheckFailed("Some required fields are empty in mapping");
    }

    yaml.dataDestinations.forEach(dataDest => {
      // every object in datasources MUST have kind
      if (!dataDest.kind) {
        throw new YamlHealthCheckFailed("dataDestination is missing 'kind' field");
      }
      // check data destinations
      dataDestinationClassMap.get(dataDest.kind).healthCheck(dataDest);
    });

    // 12. the network must be same as the source network
    // TODO: right now we don't check the block hash, so skip the same network check
    // if (config.dataDestinations[0].network !== sourceNetworks[0]) {
    //   throw new Error("dataDestinations network must match dataSources network");
    // }
  }
}
