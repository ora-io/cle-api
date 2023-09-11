export const networks = [
  {
      name: "Sepolia",
      label: "Sepolia",
      value: 11155111,
      expectedEth: 0.002,
      hex: "0xaa36a7"
  },
  {
      name: "Goerli",
      label: "Goerli",
      value: 5,
      expectedEth: 0.5,
      hex: "0x5"
  },
  {
    name: "Mainnet",
    label: "Mainnet",
    value: 1,
  }
]

export const contract_abi = {
  "contractName": "AggregatorVerifier",
  "abi": [
      {
          "inputs": [
              {
                  "internalType": "contract AggregatorVerifierCoreStep[]",
                  "name": "_steps",
                  "type": "address[]"
              }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
      },
      {
          "inputs": [
              {
                  "internalType": "uint256[]",
                  "name": "proof",
                  "type": "uint256[]"
              },
              {
                  "internalType": "uint256[]",
                  "name": "verify_instance",
                  "type": "uint256[]"
              },
              {
                  "internalType": "uint256[]",
                  "name": "aux",
                  "type": "uint256[]"
              },
              {
                  "internalType": "uint256[][]",
                  "name": "target_instance",
                  "type": "uint256[][]"
              }
          ],
          "name": "verify",
          "outputs": [],
          "stateMutability": "view",
          "type": "function",
          "constant": true
      }
  ],
}

export const addressFactory = '0x6130cBBfa2C405a4c8FA1471b98dB2c7D99028B6';
export const abiFactory = [
    "function getAllZkg() external view returns (address[] memory)",
    "function registry(address _bountyToken, uint256 _bountyReward, address _verifier, address _destAddr, string memory _graphURI) external returns (address graph)",
    "function getGraphBycreator(address creator) external view returns (address[] memory)",
    "function getGraphInfoByAddress(address graph) external view returns (address creator, uint256 bountyReward, address verifier, address destAddr, string memory graphURI)",
];

export const AddressZero = "0x0000000000000000000000000000000000000000";
