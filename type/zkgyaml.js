import yaml from "js-yaml";
import fs from "fs";
import { ethers } from "ethers";
import semver from "semver";

function isEthereumAddress(address) {
  try {
    const parsedAddress = ethers.utils.getAddress(address);
    return parsedAddress !== '0x0000000000000000000000000000000000000000';
  } catch (error) {
    return false;
  }
}

class DataSource {
  constructor(kind) {
    this.kind = kind;
  }
}

class DataDestination {
  constructor(kind) {
    this.kind = kind;
  }
}

class Mapping {
  constructor(language, file, handler) {
    this.language = language;
    this.file = file;
    this.handler = handler;
  }
  static from_v_0_0_2(yamlMapping){
    return new Mapping(
      yamlMapping.language,
      yamlMapping.file,
      yamlMapping.handler
    )
  }
  static from_v_0_0_1(yamlMapping){
    return null // not important for 0.0.1
  }
}

class EthereumDataSource extends DataSource {
  constructor(kind, network, eventSection, storageSection, accountSection, blockSection) {
    super(kind);
    this.network = network;
    this.event = eventSection;
    this.storage = storageSection;
    this.account = accountSection;
    this.block = blockSection;
  }

  static from_v_0_0_2(yamlEthDS){
    return new EthereumDataSource(
      yamlEthDS.kind,
      yamlEthDS.network,
      (yamlEthDS.event != null) ?  EventSection.from_v_0_0_2(yamlEthDS.event) : null,
      (yamlEthDS.storage != null) ? StorageSection.from_v_0_0_2(yamlEthDS.storage) : null,
      null, //TODO: account section
      null // TODO: block section
    )
  }
  static from_v_0_0_1(yamlEthDS){
    throw new Error('no 0.0.1 support'); //TODO
  }
}

class EthereumDataDestination extends DataDestination{
  constructor(kind, network, address) {
    super(kind);
    this.network = network;
    this.address = address;
  }
  static from_v_0_0_2(yamlEthDD){
    return new EthereumDataDestination(
      yamlEthDD.kind,
      yamlEthDD.network,
      yamlEthDD.address
    )
  }

  static from_v_0_0_1(yamlEthDD){
    return new EthereumDataDestination(
      yamlEthDD.kind,
      yamlEthDD.network,
      yamlEthDD.destination.address
    )
  }
}

class EventSection {
  constructor(addressList, esigsList) {
    this.addressList = addressList;
    this.esigsList = esigsList;
  }

  static from_v_0_0_2(yamlEvent){
    let loadFromEventSource = (event) => {
      const source_address = event.address;
        const source_esigs = event.events.map((ed) => {
          const eventHash = ed.startsWith("0x") ? ed : ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ed));
          return eventHash;
        });
  
        return [source_address, source_esigs];
    }
  
    const eventDSAddrList=[];
    const eventDSEsigsList=[];
    yamlEvent.map((event) => {let [sa, se] = loadFromEventSource(event); eventDSAddrList.push(sa); eventDSEsigsList.push(se)})
    
    return new EventSection(eventDSAddrList, eventDSEsigsList)
  }

  static from_v_0_0_1(yamlEvent){
    throw new Error('no 0.0.1 support'); //TODO
  }
  
  toArray(){
    return [this.addressList, this.esigsList]
  }
}

class StorageSection {
  constructor(addressList, esigsList) {
    this.addressList = addressList;
    this.slotsList = esigsList;
  }

  static from_v_0_0_2(yamlStorage){
    let loadFromStorageSource = (storage) => {
      const source_address = storage.address;
        const source_slots = storage.slots.map((sl) => {
          return ethers.utils.hexZeroPad(sl, 32);;
        });

        return [source_address, source_slots];
    }

    const stateDSAddrList=[];
    const stateDSSlotsList=[];
    yamlStorage.map((storage) => {let [sa, sl] = loadFromStorageSource(storage); stateDSAddrList.push(sa); stateDSSlotsList.push(sl)})
    return new StorageSection(stateDSAddrList, stateDSSlotsList);
  }

  static from_v_0_0_1(yamlStorage){
    throw new Error('no 0.0.1 support'); //TODO
  }

  toArray(){
    return [this.addressList, this.slotsList]
  }
}

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
    yaml.dataSources.forEach(ds => dataSources.push(EthereumDataSource.from_v_0_0_2(ds)));
    const dataDestinations = [];
    yaml.dataDestinations.forEach(dd => dataDestinations.push(EthereumDataDestination.from_v_0_0_2(dd)));

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
      return ZkGraphYaml.from_v_0_0_1(yaml)
    } else if (yaml.specVersion == "0.0.2") {
      return ZkGraphYaml.from_v_0_0_2(yaml)
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
  
  // const config = ;
  sourceType() { //TODO
    if (this.specVersion >= "0.0.2"){
      if (this.dataSources[0].event) {
        return "event";
      } else if (this.dataSources[0].storage) {
        return "storage";
      } else {
        throw new Error("At least includes event or storage section in dataSources[0]")
      }
    } else if (this.specVersion == "0.0.1"){
      return "event"; // 0.0.1 only support event
    }

    throw new Error("Unsupported specVersion: ", this.specVersion)
  }

  yamlhealthCheck() {
    // specVersion check

    if (!this.specVersion || typeof this.specVersion !== 'string' || this.specVersion.trim() === '') {
      throw new Error("specVersion is missing or empty");
    }

    if (semver.gt(this.specVersion, '0.0.2')) {
      throw new Error("Invalid specVersion, it should be <= 0.0.2");
    }

    // apiVersion → zkgraph-lib version check
    if (!this.apiVersion || typeof this.apiVersion !== 'string' || this.apiVersion.trim() === '') {
      throw new Error("apiVersion is missing or empty");
    }

    if (semver.gt(this.apiVersion, '0.0.2')) {
      throw new Error("Invalid apiVersion, it should be <= 0.0.2");
    }

    // datasources can have multiple objects, but should not be empty
    if (!this.dataSources || this.dataSources.length === 0) {
      throw new Error("dataSources should not be empty");
    }

    const sourceNetworks = [];

    this.dataSources.forEach(dataSource => {
      // every object in datasources MUST have network
      if (!dataSource.kind || !dataSource.network) {
        throw new Error("dataSource object is missing required fields");
      }

      sourceNetworks.push(dataSource.network);

      const eventCount = dataSource.event ? 1 : 0;
      const storageCount = dataSource.storage ? 1 : 0;

      if (eventCount + storageCount !== 1) {
        throw new Error("must have one and only one 'event' or 'storage' field");
      }
    });

    // every network field must be the same
    if (new Set(sourceNetworks).size !== 1) {
      throw new Error("All dataSource networks must be the same");
    }

    // all mapping fields must be not empty
    if (!this.mapping.language || !this.mapping.file || !this.mapping.handler) {
      throw new Error("Some required fields are empty in mapping");
    }

    // data destination must have network and destination
    if (this.dataDestinations) {
      if (!this.dataDestinations[0].network || !this.dataDestinations[0].address) {
        throw new Error("dataDestinations object is missing required fields");
      }

      // address must be the ethereum address and not address zero
      if (!isEthereumAddress(this.dataDestinations[0].address)) {
        throw new Error("Invalid Ethereum address in dataDestinations");
      }
    }

    // 12. the network must be same as the source network
    // TODO: right now we don't check the block hash, so skip the same network check
    // if (config.dataDestinations[0].network !== sourceNetworks[0]) {
    //   throw new Error("dataDestinations network must match dataSources network");
    // }
  }
}