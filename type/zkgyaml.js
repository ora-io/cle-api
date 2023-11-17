import yaml from "js-yaml";
import fs from "fs";
import semver from "semver";
import { YamlHealthCheckFailed } from "../common/error.js";
import { EthereumDataDestination, EthereumDataSource } from "./zkgyaml_eth.js";
import { Mapping } from "./zkgyaml_def.js";

const dataSourceClassMap = new Map();
dataSourceClassMap.set('ethereum', EthereumDataSource)

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
    if (yaml.specVersion == "0.0.1"){
      return ZkGraphYaml.from_v_0_0_1(yaml).healthCheck()
    } else if (yaml.specVersion == "0.0.2") {
      return ZkGraphYaml.from_v_0_0_2(yaml).healthCheck()
    } else {
      throw new Error("Unsupported specVersion: ", this.specVersion)
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
    let fileContents;
    try {
      // Read the YAML file contents
      fileContents = fs.readFileSync(yamlPath, "utf8");
    } catch (error) {
      console.error(error);
    }
    return ZkGraphYaml.fromYamlContent(fileContents)
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

  getKinds(isSource){
    return isSource ? this.dataSources.map(ds => ds.kind) : this.dataDestinations.map(ds => ds.kind)
  }

  getFilteredSourcesByKind(kind){
    return this.dataSources.filter(ds => ds.kind === kind)
  }

  healthCheck() {

    // specVersion check
    if (!this.specVersion || typeof this.specVersion !== 'string' || this.specVersion.trim() === '') {
      throw new YamlHealthCheckFailed("specVersion is missing or empty");
    }

    if (semver.gt(this.specVersion, '0.0.2')) {
      throw new YamlHealthCheckFailed("Invalid specVersion, it should be <= 0.0.2");
    }

    // apiVersion → zkgraph-lib version check
    if (!this.apiVersion || typeof this.apiVersion !== 'string' || this.apiVersion.trim() === '') {
      throw new YamlHealthCheckFailed("apiVersion is missing or empty");
    }

    if (semver.gt(this.apiVersion, '0.0.2')) {
      throw new YamlHealthCheckFailed("Invalid apiVersion, it should be <= 0.0.2");
    }

    // datasources can have multiple objects, but should not be empty
    if (!this.dataSources || this.dataSources.length === 0) {
      throw new YamlHealthCheckFailed("dataSources should not be empty");
    }

    const sourceKinds = [];

    this.dataSources.forEach(dataSource => {
      // every object in datasources MUST have kind
      if (!dataSource.kind) {
        throw new YamlHealthCheckFailed("dataSource is missing 'kind' field");
      }

     // check data sources
      dataSourceClassMap.get(dataSource.kind).healthCheck(dataSource);

      sourceKinds.push(dataSource.kind);
    });

    // every network field must be the same
    // if (new Set(sourceKinds).size !== 1) {
    //   throw new YamlHealthCheckFailed("All dataSource networks must be the same");
    // }

    // can only have 1 data source with kind 'ethereum' right now
    if (sourceKinds.indexOf('ethereum') != sourceKinds.lastIndexOf('ethereum')){
      throw new YamlHealthCheckFailed("Only 1 'ethereum' kind is allowed in data sources right now");
    }

    // all mapping fields must be not empty
    if (!this.mapping.language || !this.mapping.file || !this.mapping.handler) {
      throw new YamlHealthCheckFailed("Some required fields are empty in mapping");
    }

    this.dataDestinations.forEach(dataDest => {
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
    return this;
  }
}