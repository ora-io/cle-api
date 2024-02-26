export const cleContractABI = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'bountyReward',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'bountyToken',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'cleURI',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deposit',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'destAddr',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'dspID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'encoding_scalars_to_point',
    inputs: [
      {
        name: 'a',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'b',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'c',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'x',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'y',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'factory',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pointX',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pointY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'trigger',
    inputs: [
      {
        name: 'proof',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'verifyInstance',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'aux',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'targetInstance',
        type: 'uint256[][]',
        internalType: 'uint256[][]',
      },
      {
        name: 'extra',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateReward',
    inputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'verifyToCalldata',
    inputs: [
      {
        name: 'proof',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'verifyInstance',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'aux',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
      {
        name: 'targetInstance',
        type: 'uint256[][]',
        internalType: 'uint256[][]',
      },
      {
        name: 'extra',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Revert',
    inputs: [
      {
        name: 'reason',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Trigger',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
        indexed: false,
        internalType: 'bytes',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'UpdateReward',
    inputs: [
      {
        name: 'oldReward',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newReward',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
]

// let old = [
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: '_bountyToken',
//         type: 'address',
//       },
//       {
//         internalType: 'uint256',
//         name: '_bountyReward',
//         type: 'uint256',
//       },
//       {
//         internalType: 'address',
//         name: '_verifier',
//         type: 'address',
//       },
//       {
//         internalType: 'address',
//         name: '_destAddr',
//         type: 'address',
//       },
//       {
//         internalType: 'string',
//         name: '_graphURI',
//         type: 'string',
//       },
//     ],
//     stateMutability: 'nonpayable',
//     type: 'constructor',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'previousOwner',
//         type: 'address',
//       },
//       {
//         indexed: true,
//         internalType: 'address',
//         name: 'newOwner',
//         type: 'address',
//       },
//     ],
//     name: 'OwnershipTransferred',
//     type: 'event',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: false,
//         internalType: 'address',
//         name: 'sender',
//         type: 'address',
//       },
//       {
//         indexed: false,
//         internalType: 'bytes',
//         name: 'zkgState',
//         type: 'bytes',
//       },
//     ],
//     name: 'Trigger',
//     type: 'event',
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'oldReward',
//         type: 'uint256',
//       },
//       {
//         indexed: false,
//         internalType: 'uint256',
//         name: 'newReward',
//         type: 'uint256',
//       },
//     ],
//     name: 'UpdateReward',
//     type: 'event',
//   },
//   {
//     inputs: [],
//     name: 'bountyReward',
//     outputs: [
//       {
//         internalType: 'uint256',
//         name: '',
//         type: 'uint256',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'bountyToken',
//     outputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'uint256',
//         name: 'amount',
//         type: 'uint256',
//       },
//     ],
//     name: 'deposit',
//     outputs: [],
//     stateMutability: 'payable',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'destAddr',
//     outputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'uint256',
//         name: 'blockNumber',
//         type: 'uint256',
//       },
//       {
//         internalType: 'bytes32',
//         name: 'blockHash',
//         type: 'bytes32',
//       },
//       {
//         internalType: 'bytes',
//         name: 'zkgState',
//         type: 'bytes',
//       },
//     ],
//     name: 'encodePublicInput',
//     outputs: [
//       {
//         internalType: 'uint256[]',
//         name: '',
//         type: 'uint256[]',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'factory',
//     outputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'graphURI',
//     outputs: [
//       {
//         internalType: 'string',
//         name: '',
//         type: 'string',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'owner',
//     outputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'renounceOwnership',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'address',
//         name: 'newOwner',
//         type: 'address',
//       },
//     ],
//     name: 'transferOwnership',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'uint256[]',
//         name: 'proof',
//         type: 'uint256[]',
//       },
//       {
//         internalType: 'uint256[]',
//         name: 'verifyInstance',
//         type: 'uint256[]',
//       },
//       {
//         internalType: 'uint256[]',
//         name: 'aux',
//         type: 'uint256[]',
//       },
//       {
//         internalType: 'uint256[][]',
//         name: 'targetInstance',
//         type: 'uint256[][]',
//       },
//       {
//         internalType: 'uint256[]',
//         name: 'extra',
//         type: 'uint256[]',
//       },
//     ],
//     name: 'trigger',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'uint256',
//         name: 'amount',
//         type: 'uint256',
//       },
//     ],
//     name: 'updateReward',
//     outputs: [],
//     stateMutability: 'nonpayable',
//     type: 'function',
//   },
//   {
//     inputs: [],
//     name: 'verifier',
//     outputs: [
//       {
//         internalType: 'address',
//         name: '',
//         type: 'address',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
//   {
//     inputs: [
//       {
//         internalType: 'uint256',
//         name: 'blockNumber',
//         type: 'uint256',
//       },
//       {
//         internalType: 'bytes32',
//         name: 'blockHash',
//         type: 'bytes32',
//       },
//       {
//         internalType: 'bytes',
//         name: 'zkgState',
//         type: 'bytes',
//       },
//       {
//         internalType: 'uint256[]',
//         name: 'proof',
//         type: 'uint256[]',
//       },
//       {
//         internalType: 'uint256[]',
//         name: 'verify_instance',
//         type: 'uint256[]',
//       },
//       {
//         internalType: 'uint256[]',
//         name: 'aux',
//         type: 'uint256[]',
//       },
//     ],
//     name: 'verify',
//     outputs: [
//       {
//         internalType: 'bool',
//         name: '',
//         type: 'bool',
//       },
//     ],
//     stateMutability: 'view',
//     type: 'function',
//   },
// ]
