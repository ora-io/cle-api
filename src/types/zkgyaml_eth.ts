import { ethers } from 'ethers'
import { YamlHealthCheckFailed, YamlNotSupported } from '../common/error.js'
import { DataDestination, DataSource } from './zkgyaml_def'

function isEthereumAddress(address: string) {
  try {
    const parsedAddress = ethers.utils.getAddress(address)
    return parsedAddress !== '0x0000000000000000000000000000000000000000'
  }
  catch (error) {
    return false
  }
}

export class EthereumDataSource extends DataSource {
  network: string
  event: EventSection | null
  storage: StorageSection | null
  account: any
  block: any
  constructor(
    kind: string,
    network: string,
    eventSection: EventSection | null,
    storageSection: StorageSection | null,
    accountSection: any,
    blockSection: any,
  ) {
    super(kind)
    this.network = network
    this.event = eventSection
    this.storage = storageSection
    this.account = accountSection
    this.block = blockSection
  }

  static from_v_0_0_2(yamlEthDS: { kind: string; network: string; event: EventSection[]; storage: StorageSection[] }) {
    return new EthereumDataSource(
      yamlEthDS.kind,
      yamlEthDS.network,
      (yamlEthDS.event != null) ? EventSection.from_v_0_0_2(yamlEthDS.event) : null,
      (yamlEthDS.storage != null) ? StorageSection.from_v_0_0_2(yamlEthDS.storage) : null,
      null, // TODO: account section
      null, // TODO: block section
    )
  }

  static from_v_0_0_1(_yamlEthDS: any) {
    throw new Error('no 0.0.1 support') // TODO
  }

  // signaficant to decide which lib dsp main it should use.
  getSignificantKeys() {
    return [this.kind]
  }

  static healthCheck(ds: { event: any; storage: any }) {
    const eventCount = ds.event ? 1 : 0
    const storageCount = ds.storage ? 1 : 0

    if (eventCount + storageCount !== 1)
      throw new YamlNotSupported('currently requires only one \'event\' or \'storage\' field')
  }
}

export class EthereumDataDestination extends DataDestination {
  network: string
  address: string
  constructor(kind: string, network: string, address: string) {
    super(kind)
    this.network = network
    this.address = address
  }

  // signaficant to decide which lib dsp main it should use.
  getSignificantKeys() {
    return [this.kind]
  }

  static from_v_0_0_2(yamlEthDD: { kind: string; network: string; address: string }) {
    return new EthereumDataDestination(
      yamlEthDD.kind,
      yamlEthDD.network,
      yamlEthDD.address,
    )
  }

  static from_v_0_0_1(yamlEthDD: { kind: string; network: string; destination: { address: string } }) {
    return new EthereumDataDestination(
      yamlEthDD.kind,
      yamlEthDD.network,
      yamlEthDD.destination.address,
    )
  }

  static healthCheck(dd: { network: string; address: string }) {
    // data destination must have network and address
    if (!dd.network || !dd.address)
      throw new YamlHealthCheckFailed('dataDestinations object is missing required fields')

    // address must be the ethereum address and not address zero
    if (!isEthereumAddress(dd.address))
      throw new YamlHealthCheckFailed('Invalid Ethereum address in dataDestinations')
  }
}

class EventSection {
  addressList: any[]
  esigsList: any[]
  constructor(addressList: any[], esigsList: any[]) {
    this.addressList = addressList
    this.esigsList = esigsList
  }

  static from_v_0_0_2(yamlEvent: any[]) {
    const loadFromEventSource = (event: { address: any; events: any[] }) => {
      const source_address = event.address
      const source_esigs = event.events.map((ed: string) => {
        const eventHash = ed.startsWith('0x') ? ed : ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ed))
        return eventHash
      })

      return [source_address, source_esigs]
    }

    const eventDSAddrList: any[] = []
    const eventDSEsigsList: any[] = []
    yamlEvent.forEach((event: any) => { const [sa, se] = loadFromEventSource(event); eventDSAddrList.push(sa); eventDSEsigsList.push(se) })

    return new EventSection(eventDSAddrList, eventDSEsigsList)
  }

  static from_v_0_0_1(_yamlEvent: any) {
    throw new Error('no 0.0.1 support') // TODO
  }

  toArray() {
    return [this.addressList, this.esigsList]
  }
}

class StorageSection {
  addressList: any
  slotsList: any
  constructor(addressList: any[], esigsList: any[]) {
    this.addressList = addressList
    this.slotsList = esigsList
  }

  static from_v_0_0_2(yamlStorage: StorageSection[]) {
    const loadFromStorageSource = (storage: { address: any; slots: any[] }) => {
      const source_address = storage.address
      const source_slots = storage.slots.map((sl: ethers.utils.BytesLike) => {
        return ethers.utils.hexZeroPad(sl, 32)
      })

      return [source_address, source_slots]
    }

    const stateDSAddrList: any[] = []
    const stateDSSlotsList: any[] = []
    yamlStorage.forEach((storage: any) => { const [sa, sl] = loadFromStorageSource(storage); stateDSAddrList.push(sa); stateDSSlotsList.push(sl) })
    return new StorageSection(stateDSAddrList, stateDSSlotsList)
  }

  static from_v_0_0_1(_yamlStorage: any) {
    throw new Error('no 0.0.1 support') // TODO
  }

  toArray() {
    return [this.addressList, this.slotsList]
  }
}
