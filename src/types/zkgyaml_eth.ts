import { ethers } from 'ethers'
import { YamlHealthCheckFailed, YamlNotSupported } from '../common/error'
import type { DataDestinationKind, DataSourceKind } from './zkgyaml_def'
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
class EventItem {
  constructor(
    public address: string,
    public events: string[],
  ) {
    // this.address = address.toLowerCase()
  }
}
class StorageItem {
  constructor(
    public address: string,
    public slots: string[], // ethers.utils.BytesLike[]
  ) {
    // this.address = address.toLowerCase()
  }
}
class TransactionItem {
  constructor(
    public from: string,
    public to: string,
  ) {
    this.from = from.toLowerCase()
    this.to = to.toLowerCase()
  }
}
class EventSectionCache {
  constructor(
    public addressList: string[],
    public esigsList: string[][],
  ) {
    this.addressList = addressList.map(item => item.toLowerCase())
  }
}
class StorageSectionCache {
  constructor(
    public addressList: string[],
    public slotsList: string[][],
  ) {
    this.addressList = addressList.map(item => item.toLowerCase())
  }
}

export class EthereumDataSource extends DataSource {
  unsafe: boolean
  network: string
  // event: EventSection | null
  // storage: StorageSection | null
  event: EventItem[] | null
  storage: StorageItem[] | null
  transaction: TransactionItem[] | null
  account: any[] | null
  block: any

  eventSectionCache: EventSectionCache | null = null
  storageSectionCache: StorageSectionCache | null = null

  constructor(
    kind: DataSourceKind,
    unsafe: boolean,
    network: string,
    event: EventItem[] | null,
    storage: StorageItem[] | null,
    transaction: TransactionItem[] | null,
    account: any[] | null,
    block: any,
  ) {
    super(kind)
    this.unsafe = unsafe
    this.network = network
    this.event = event
    this.storage = storage
    this.transaction = transaction
    this.account = account
    this.block = block
  }

  static from_v_0_0_2(yamlEthDS: { kind: DataSourceKind; unsafe?: boolean; network: string; event: EventItem[]; storage: StorageItem[]; transaction: TransactionItem[] }) {
    return new EthereumDataSource(
      yamlEthDS.kind,
      yamlEthDS.unsafe == null ? false : yamlEthDS.unsafe,
      yamlEthDS.network,
      // (yamlEthDS.event != null) ? EventSection.from_v_0_0_2(yamlEthDS.event) : null,
      // (yamlEthDS.storage != null) ? StorageSection.from_v_0_0_2(yamlEthDS.storage) : null,
      yamlEthDS.event,
      yamlEthDS.storage,
      yamlEthDS.transaction,
      null, // TODO: account section
      null, // TODO: block section
    )
  }

  static from_v_0_0_1(_yamlEthDS: any) {
    throw new Error('no 0.0.1 support') // TODO
  }

  // signaficant to decide which lib dsp main it should use.
  getSignificantKeys(): string[] {
    return this.unsafe ? [this.kind, 'unsafe'] : [this.kind]
  }

  getEventLists(useCache = true) {
    // return if there's cache, cause it's always the same
    if (!useCache || this.eventSectionCache == null) {
      const loadFromEventSource = (eventItem: EventItem) => {
        const source_address = eventItem.address
        const source_esigs = eventItem.events.map((ed: string) => {
          const eventHash = ed.startsWith('0x') ? ed : ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ed))
          return eventHash
        })

        return [source_address, source_esigs] as [string, string[]]
      }

      const eventDSAddrList: string[] = []
      const eventDSEsigsList: string[][] = []
      if (this.event)
        this.event.forEach((event: any) => { const [sa, se] = loadFromEventSource(event); eventDSAddrList.push(sa); eventDSEsigsList.push(se) })

      this.eventSectionCache = new EventSectionCache(eventDSAddrList, eventDSEsigsList)
    }
    return [this.eventSectionCache.addressList, this.eventSectionCache.esigsList] as [string[], string[][]]
  }

  getStorageLists(useCache = true) {
    // return if there's cache, cause it's always the same
    if (!useCache || this.storageSectionCache == null) {
      const loadFromStorageSource = (storage: StorageItem) => {
        const source_address = storage.address.toLowerCase()
        const source_slots = storage.slots.map((sl: ethers.utils.BytesLike) => {
          return ethers.utils.hexZeroPad(sl, 32)
        })

        return [source_address, source_slots] as [string, string[]]
      }

      const stateDSAddrList: string[] = []
      const stateDSSlotsList: string[][] = []
      if (this.storage) {
        this.storage.forEach((storage: any) => {
          const [sa, sl] = loadFromStorageSource(storage)
          stateDSAddrList.push(sa)
          stateDSSlotsList.push(sl)
        })
      }
      this.storageSectionCache = new StorageSectionCache(stateDSAddrList, stateDSSlotsList)
    }
    return [this.storageSectionCache.addressList, this.storageSectionCache.slotsList] as [string[], string[][]]
  }

  static healthCheck(ds: { kind: DataSourceKind; unsafe?: boolean; network: string; event: any; storage: any; transaction: any }) {
    const validUnsafeType = ['boolean', 'undefined']
    if (!validUnsafeType.includes(typeof ds.unsafe))
      throw new YamlHealthCheckFailed(`unsafe only accept boolean when defined, provided: ${typeof ds.unsafe}`)

    if (ds.network == null)
      throw new YamlHealthCheckFailed('missing \'network\' in Ethereum DS')

    // for safe mode, only accept 1 kind of eth state due to proving limits
    if (ds.unsafe !== true) {
      const eventCount = ds.event ? 1 : 0
      const storageCount = ds.storage ? 1 : 0
      const transactionCount = ds.transaction ? 1 : 0

      if (eventCount + storageCount + transactionCount !== 1)
        throw new YamlNotSupported('currently safe mode supports only either \'event\' or \'storage\' or \'transaction\' field, try "unsafe: true" for partially proof cases.')
    }

    if (ds.transaction)
      console.warn('Ethereum transaction section is still EXPERIMENTAL, use at your own risks.')
  }
}

export class EthereumDataDestination extends DataDestination {
  network: string
  address: string
  constructor(kind: DataDestinationKind, network: string, address: string) {
    super(kind)
    this.network = network
    this.address = address
  }

  // signaficant to decide which lib dsp main it should use.
  getSignificantKeys() {
    return [this.kind]
  }

  static from_v_0_0_2(yamlEthDD: { kind: DataDestinationKind; network: string; address: string }) {
    return new EthereumDataDestination(
      yamlEthDD.kind,
      yamlEthDD.network,
      yamlEthDD.address,
    )
  }

  static from_v_0_0_1(yamlEthDD: { kind: DataDestinationKind; network: string; destination: { address: string } }) {
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
