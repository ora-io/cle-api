import yaml from "js-yaml";
import fs from "fs";
import { ethers } from "ethers";

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
    yaml.dataDestinations.forEach(dd => dataSources.push(EthereumDataDestination.from_v_0_0_2(dd)));

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
}