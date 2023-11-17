
import { ethers } from "ethers";
import { YamlHealthCheckFailed } from "../common/error.js";
import { DataSource, DataDestination } from "./zkgyaml_def.js";

function isEthereumAddress(address) {
  try {
    const parsedAddress = ethers.utils.getAddress(address);
    return parsedAddress !== '0x0000000000000000000000000000000000000000';
  } catch (error) {
    return false;
  }
}

export class EthereumDataSource extends DataSource {
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

  static healthCheck(ds){
    const eventCount = ds.event ? 1 : 0;
    const storageCount = ds.storage ? 1 : 0;

    if (eventCount + storageCount !== 1) {
      throw new YamlHealthCheckFailed("must have one and only one 'event' or 'storage' field");
    }
  }
}

export class EthereumDataDestination extends DataDestination{
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

  static healthCheck(dd){

    // data destination must have network and address
    if (!dd.network || !dd.address) {
      throw new YamlHealthCheckFailed("dataDestinations object is missing required fields");
    }

    // address must be the ethereum address and not address zero
    if (!isEthereumAddress(dd.address)) {
      throw new YamlHealthCheckFailed("Invalid Ethereum address in dataDestinations");
    }
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