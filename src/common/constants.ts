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

export const graph_abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bountyToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_bountyReward',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_verifier',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_destAddr',
        type: 'address',
      },
      {
        internalType: 'string',
        name: '_graphURI',
        type: 'string',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'zkgState',
        type: 'bytes',
      },
    ],
    name: 'Trigger',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldReward',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newReward',
        type: 'uint256',
      },
    ],
    name: 'UpdateReward',
    type: 'event',
  },
  {
    inputs: [],
    name: 'bountyReward',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bountyToken',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'destAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'zkgState',
        type: 'bytes',
      },
    ],
    name: 'encodePublicInput',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'graphURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'zkgState',
        type: 'bytes',
      },
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
    ],
    name: 'trigger',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'updateReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'verifier',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'blockNumber',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: 'blockHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'zkgState',
        type: 'bytes',
      },
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
    ],
    name: 'verify',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

export const addressFactory = {
  mainnet: 'not support yet',
  sepolia: '0xE484E5B8b71aA7955d1De4D52737BF436eBf9970',
  goerli: 'not support yet',
}
export const abiFactory = [
  'function getAllZkg() external view returns (address[] memory)',
  'function registry(address destAddr, address bountyToken, uint256 bountyReward, bytes32 dspID, string memory _graphURI, uint256 pointX, uint256 pointY) external returns (address graph)',
  'function getGraphBycreator(address creator) external view returns (address[] memory)',
  'function getGraphInfoByAddress(address graph) external view returns (address creator, uint256 bountyReward, address verifier, address destAddr, string memory graphURI)',
]

export const AggregatorVerifierAddress = {
  mainnet: 'not support yet',
  sepolia: '0x714C66711F6552D4F388Ec79D4A33FE20173cC34',
  goerli: '0x5e6ca2dd26eA8F9A17aEc6e35a8dcD7C5B12FcDF',
}

export const AddressZero = '0x0000000000000000000000000000000000000000'
