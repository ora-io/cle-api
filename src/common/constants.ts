export { cleContractABI } from './abi/clecontractabi'

export const networks = [
  {
    name: 'Sepolia',
    label: 'Sepolia',
    value: 11155111,
    expectedEth: 0.002,
    hex: '0xaa36a7',
  },
  {
    name: 'Goerli',
    label: 'Goerli',
    value: 5,
    expectedEth: 0.5,
    hex: '0x5',
  },
  {
    name: 'Mainnet',
    label: 'Mainnet',
    value: 1,
  },
]

export const AggregatorVerifierABI = {
  contractName: 'AggregatorVerifier',
  abi: [
    {
      inputs: [
        {
          internalType: 'contract AggregatorVerifierCoreStep[]',
          name: '_steps',
          type: 'address[]',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [
        {
          internalType: 'uint256[]',
          name: 'proof',
          type: 'uint256[]',
        },
        {
          internalType: 'uint256[]',
          name: 'verify_instance',
          type: 'uint256[]',
        },
        {
          internalType: 'uint256[]',
          name: 'aux',
          type: 'uint256[]',
        },
        {
          internalType: 'uint256[][]',
          name: 'target_instance',
          type: 'uint256[][]',
        },
      ],
      name: 'verify',
      outputs: [],
      stateMutability: 'view',
      type: 'function',
      constant: true,
    },
  ],
}

export const addressFactory = {
  mainnet: 'not support yet',
  sepolia: '0xE484E5B8b71aA7955d1De4D52737BF436eBf9970',
  goerli: 'not support yet',
}
export const abiFactory = [
  'function getAllCLEs() external view returns (address[] memory)',
  'function registry(address destAddr,address bountyToken,uint256 bountyReward,bytes32 dspID,string memory cleURI,uint256 pointX,uint256 pointY) public returns (address cle)',
  'function getCLEBycreator(address creator) external view returns (address[] memory)',
  'function getCLEInfoByAddress(address cle) external view returns (address creator, uint256 bountyReward, address destAddr, string memory cleURI)',
]

export const AggregatorVerifierAddress: { [key: string]: { [key: string]: string } } = {
  ZkWasmHub: {
    mainnet: 'not support yet',
    sepolia: '0xfD74dce645Eb5EB65D818aeC544C72Ba325D93B0',
    goerli: '0xbEF9572648284CB63a0DA32a89D3b4F2BeD65a89',
  },
  Ora: {
    mainnet: 'not support yet',
    sepolia: '0xf48dC1e1AaA6bB8cA43b03Ca0695973a2F440090',
    goerli: 'not support yet',
  },
}

export const AddressZero = '0x0000000000000000000000000000000000000000'

export const DEFAULT_PATH = {
  YAML: 'src/cle.yaml',
  OUT_WASM: 'build/cle.wasm',
  OUT_WAT: 'build/cle.wat',
  OUT_INNER_WASM: 'build/inner_pre_pre.wasm',
  OUT_INNER_WAT: 'build/inner_pre_pre.wat',
}

export const DEFAULT_URL = {
  PROVER: 'https://rpc.zkwasmhub.com:8090',
  ZKWASMHUB: 'https://rpc.zkwasmhub.com:8090',
  COMPILER_SERVER: 'http://compiler.hyperoracle.io/compile',
  PINATA: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
}

export const DEFAULT_CIRCUIT_SIZE = 22
export const MIN_CIRCUIT_SIZE = 18
export const MAX_CIRCUIT_SIZE = 24

export const FinishStatusList = ['Done', 'Fail', 'DryRunFailed']
