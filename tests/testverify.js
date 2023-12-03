/* eslint-disable no-console */
// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from '../src/index'

const rpcUrl = 'https://rpc.ankr.com/eth_sepolia'

const yamlPath = 'tests/testsrc/zkgraph-event.yaml'
// let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
const ZkwasmProviderUrl = 'https://rpc.zkwasmhub.com:8090'
// let proveTaskId = "6554584c82ab2c8b29dbc2c2" // true
const proveTaskId = '655568eaadb2c56ffd2f0ee0' // fasle

const yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath)
const proofParams = await zkgapi.getVerifyProofParamsByTaskID(proveTaskId, ZkwasmProviderUrl)

let result = await zkgapi.verify(
  { wasmUint8Array: null, zkgraphYaml: yaml },
  proofParams,
  rpcUrl,
)

console.log(result)

// 2nd way to verify proof.

const sepolia_verifier = '0x714C66711F6552D4F388Ec79D4A33FE20173cC34'

result = await zkgapi.verifyProof(
  sepolia_verifier,
  proofParams,
  rpcUrl,
)

console.log(result)
