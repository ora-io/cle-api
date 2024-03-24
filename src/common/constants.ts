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
  sepolia: '0x638e019Cfd8A5f1c2fecd473062471c7f6978c9B',
  goerli: 'not support yet',
}
export const abiFactory = [
  'function getAllCLEs() external view returns (address[] memory)',
  'function registry(address destAddr,address bountyToken,uint256 bountyReward,bytes32 dspID,string memory cleURI,uint256 pointX,uint256 pointY) public returns (address cle)',
  'function getCLEBycreator(address creator) external view returns (address[] memory)',
  'function getCLEInfoByAddress(address cle) external view returns (address creator, uint256 bountyReward, address destAddr, string memory cleURI)',
]

export const EventSigNewCLE = '0x39f7254e91d2eee9fa8ffc88bc7b0dff5c67916b7a1cc84284b3192bde4ab1d2'

export const AggregatorVerifierAddress: { [key: string]: { [key: string]: string } } = {
  ZKWASMHUB: {
    mainnet: 'not support yet',
    sepolia: '0xfD74dce645Eb5EB65D818aeC544C72Ba325D93B0',
    goerli: '0xbEF9572648284CB63a0DA32a89D3b4F2BeD65a89',
  },
  ORA: {
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
  COMPILER_SERVER: 'https://compiler.ora.io/compile',
  PINATA: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
}

export const DEFAULT_CIRCUIT_SIZE = 22
export const MIN_CIRCUIT_SIZE = 18
export const MAX_CIRCUIT_SIZE = 24

export const PROVER_RPC_CONSTANTS = {
  TASK_STATUS_DONE: 'Done',
  TASK_STATUS_FAIL: 'Fail',
  TASK_STATUS_DRYRUNFAILED: 'DryRunFailed',
  TASK_STATUS_SETUP_FINISH_LIST: ['Done', 'Fail'],
  TASK_STATUS_PROVE_FINISH_LIST: ['Done', 'Fail', 'DryRunFailed'],
  IMAGE_STATUS_VALID: 'Verified',
  TASK_TYPE_SETUP: 'Setup',
  TASK_TYPE_RESET: 'Reset',
}

// TODO: compatible only, deprecating
export const FinishStatusList = PROVER_RPC_CONSTANTS.TASK_STATUS_PROVE_FINISH_LIST
