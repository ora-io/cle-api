import { DEFAULT_URL } from '../src/common/constants'
import type { NetworksConfig } from '../src/common/utils'
import { config } from './config'
// for storage case
import { getLatestBlocknumber } from './utils/ethers'

interface OptionType {
  mappingPath: string
  yamlPath: string
  wasmPath: string
  watPath: string
  local: boolean
  expectedState: string
  blocknum: NetworksConfig
  zkwasmUrl: string
}

const defaultPath = (pathFromFixtures: string) => {
  return {
    mappingPath: `tests/fixtures/${pathFromFixtures}/mapping.ts`,
    yamlPath: `tests/fixtures/${pathFromFixtures}/cle-event.yaml`,
    wasmPath: `tests/fixtures/build/${pathFromFixtures}.wasm`,
    watPath: `tests/fixtures/build/${pathFromFixtures}.wat`,
  }
}
const latestblocknum = {
  sepolia: await getLatestBlocknumber(config.JsonRpcProviderUrl.sepolia) - 1, // -1: allow a cache time on rpc side
  mainnet: await getLatestBlocknumber(config.JsonRpcProviderUrl.mainnet) - 1,
}
// for event case
const eventblocknum = {
  sepolia: 2279547, // to test event use 2279547, to test storage use latest blocknum
  mainnet: 17633573,
}

export const fixtures: Record<string, OptionType> = {
  'dsp/ethereum(storage)': {
    ...defaultPath('dsp/ethereum(storage)'),
    local: false,
    expectedState: 'a60ecf32309539dd84f27a9563754dca818b815e', // storage case
    blocknum: latestblocknum,
    zkwasmUrl: DEFAULT_URL.ZKWASMHUB,
  },
  'dsp/ethereum(event)': {
    ...defaultPath('dsp/ethereum(event)'),
    local: false,
    expectedState: '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // event case
    blocknum: eventblocknum,
    zkwasmUrl: DEFAULT_URL.ZKWASMHUB,
  },
  'dsp/ethereum.unsafe': {
    ...defaultPath('dsp/ethereum.unsafe'),
    local: false,
    expectedState: '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // event case
    blocknum: eventblocknum,
    zkwasmUrl: DEFAULT_URL.ZKWASMHUB,
  },
  'dsp/ethereum.unsafe-ethereum': {
    ...defaultPath('dsp/ethereum.unsafe-ethereum'),
    local: false,
    expectedState: '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794000000005c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // use event return
    blocknum: eventblocknum,
    zkwasmUrl: DEFAULT_URL.ZKWASMHUB,
  },
  'prove(event)': {
    ...defaultPath('dsp/ethereum(event)'),
    // yamlPath: 'tests/testsrc/cle-event.yaml',
    // wasmPath: 'tests/build/cle-event.wasm',
    expectedState: '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // use event return
    blocknum: eventblocknum,
    zkwasmUrl: DEFAULT_URL.ZKWASMHUB,
    // watPath: '',
    // mappingPath: '',
    local: false,
  },
  'prove(storage)': {
    ...defaultPath('dsp/ethereum(storage)'),
    // yamlPath: 'tests/testsrc/cle-storage.yaml',
    // wasmPath: 'tests/build/cle-storage.wasm',
    expectedState: 'a60ecf32309539dd84f27a9563754dca818b815e', // use event return
    blocknum: latestblocknum,
    zkwasmUrl: DEFAULT_URL.ZKWASMHUB,
    // watPath: '',
    // mappingPath: '',
    local: false,
  },
}

// const proveModeOptionsForEvent = {
//   wasmPath: 'tests/build/cle-event.wasm',
//   yamlPath: 'tests/testsrc/cle-event.yaml',
//   zkwasmUrl: 'https://rpc.zkwasmhub.com:8090',
// }

// const proveModeOptionsForStorage = {
//   wasmPath: 'tests/build/cle-storage.wasm',
//   yamlPath: 'tests/testsrc/cle-storage.yaml',
//   zkwasmUrl: 'https://rpc.zkwasmhub.com:8090',
// }
// const dspname = 'ethereum' // with storage case
// const dspExpectedState =

// const dspname = 'ethereum.unsafe' // with event case
// const dspExpectedState = '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794' // event case

// const dspname = 'ethereum.unsafe-ethereum'
// const dspExpectedState = '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794000000005c7a6cf20cbd3eef32e19b9cad4eca17c432a794' // use event return
// const dspExpectedState = '6370902000000003336530047e5ec3da40c000000000068f1888e6eb7036fffe', // unsafe-safe use storage return
