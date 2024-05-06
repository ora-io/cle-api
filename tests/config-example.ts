import { DEFAULT_URL } from '../src/common/constants'

export const config = {
  JsonRpcProviderUrl: { // Erigon node rpc are highly recommended here.
    mainnet: 'https://rpc.ankr.com/eth',
    sepolia: 'https://rpc.ankr.com/eth_sepolia',
  },
  UserPrivateKey: '0x{key}',
  CompilerServerEndpoint: DEFAULT_URL.COMPILER_SERVER,
  ZkwasmProviderUrl: DEFAULT_URL.ZKWASMHUB,
}
