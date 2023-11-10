
// const wasm = fs.readFileSync("tests/build/zkgraph_local.wasm");
// const wasmUnit8Array = new Uint8Array(wasm);

// let [err, result] = await zkgapi.prove(
//     wasmUnit8Array,
//     pri,
//     pub,
//     "https://zkwasm-explorer.delphinuslab.com:8090",
//     config.UserPrivateKey,
//     !enableLog)

// console.log('error:', err)
// console.log('result:', result)

import fs from "fs";

import * as zkgapi from "../index.js";

import { config } from "./config.js";


let isLocal = false
let blocknumfortest = {
  sepolia: 4666901, // to test event use 2279547, to test storage use latest blocknum
  mainnet: 17633573,
};
let zkgstatefortest = {
   // update this when update the blocknumfortest
    'sepolia': '0x6370902000000003336530047e5ec3da40c000000000068f1888e6eb7036fffe',
}

console.log(config)

let proveOptions = {
  'blockId': blocknumfortest.sepolia,
  'wasmPath': "tests/build/zkgraph_full.wasm",
  'yamlPath': "tests/testsrc/zkgraph2.yaml",
  'jsonRpcProviderUrl': config.JsonRpcProviderUrl.sepolia,
  'expectedStateStr': zkgstatefortest.sepolia,
  'local': isLocal
}
async function test_proveMock(options) {
  const { yamlPath, jsonRpcProviderUrl, wasmPath, blockId, local, expectedStateStr } = options
  
  const wasm = fs.readFileSync(wasmPath)
  const wasmUnit8Array = new Uint8Array(wasm)
  const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
  
  let yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath)
  let dsp = zkgapi.dspHub.getDSPByYaml(yaml, {'isLocal':false})
  
  const proveParams = dsp.toProveParams(
    jsonRpcProviderUrl,
    blockId,
    expectedStateStr,
  )
  const [privateInputStr, publicInputStr] = await zkgapi.proveInputGen(
    yamlContent,
    proveParams,
    local,
    true,
  )

  return await zkgapi.proveMock(
    wasmUnit8Array,
    privateInputStr,
    publicInputStr
  )
}

let result = await test_proveMock(proveOptions)
console.log(`ZKGRAPH PROVE MOCK: ${result ? 'SUCCESS' : 'FAILED. please check your expectState or "require" conditions.'}\n`)
