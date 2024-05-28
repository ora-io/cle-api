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
}

const defaultPath = (pathFromFixtures: string) => {
  return {
    mappingPath: `tests/fixtures/${pathFromFixtures}/mapping.ts`,
    yamlPath: `tests/fixtures/${pathFromFixtures}/cle.yaml`,
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
  },
  'dsp/ethereum(event)': {
    ...defaultPath('dsp/ethereum(event)'),
    local: false,
    expectedState: '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // event case
    blocknum: eventblocknum,
  },
  'dsp/ethereum.unsafe': {
    ...defaultPath('dsp/ethereum.unsafe'),
    local: false,
    expectedState: '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // event case
    blocknum: eventblocknum,
  },
  'dsp/ethereum.unsafe-ethereum': {
    ...defaultPath('dsp/ethereum.unsafe-ethereum'),
    local: false,
    expectedState: '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794000000005c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // use event return
    blocknum: eventblocknum,
  },
}
