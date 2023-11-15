import fs from "fs";

import * as zkgapi from "../index.js";

import { config } from "./config.js";

let blocknumfortest = {
  sepolia: 4673221, // to test event use 2279547, to test storage use latest blocknum
  mainnet: 17633573,
};

let execOptions = {
  'blockId': blocknumfortest.sepolia,
  'wasmPath': "tests/build/zkgraph_full.wasm",
  'yamlPath': "tests/testsrc/zkgraph-storage.yaml",
  'jsonRpcProviderUrl': config.JsonRpcProviderUrl.sepolia,
  'local': false
}
async function test_exec(options) {
  const { yamlPath, jsonRpcProviderUrl, wasmPath, blockId, local } = options
  
  const wasm = fs.readFileSync(wasmPath)
  const wasmUint8Array = new Uint8Array(wasm)
  // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
  let yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath)
  let dsp = zkgapi.dspHub.getDSPByYaml(yaml, {'isLocal':false})
  
  const execParams = dsp.toExecParams(
    jsonRpcProviderUrl,
    blockId,
  )
  const state = await zkgapi.execute(
    {'wasmUint8Array': wasmUint8Array, 'zkgraphYaml': yaml},
    execParams,
    local,
    true,
  )

  return state
}


async function test_exec_with_prepare_data(options) {
  const { yamlPath, jsonRpcProviderUrl, wasmPath, blockId, local } = options
  
  const wasm = fs.readFileSync(wasmPath)
  const wasmUint8Array = new Uint8Array(wasm)
  // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
  let yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath)
  let dsp = zkgapi.dspHub.getDSPByYaml(yaml, {'isLocal':false})
  
  const execParams = dsp.toExecParams(
    jsonRpcProviderUrl,
    blockId,
  )
  
  /**
   * Prepare Data, can construct your own dataPrep based on this.
   * the actual dataPrep here is instance of zkgapi.ETHDSP.EthereumDataPrep
   */
  let dataPrep = await dsp.prepareData(yaml, await dsp.toPrepareParamsFromExecParams(execParams))

  const state = await zkgapi.executeOnDataPrep(
    {'wasmUint8Array': wasmUint8Array, 'zkgraphYaml': yaml},
    dataPrep,
    local,
    true,
  )

  return state
}

let stateu8a = await test_exec(execOptions)
// let stateu8a = await test_exec_with_prepare_data(execOptions)

console.log(`ZKGRAPH STATE OUTPUT: ${zkgapi.utils.toHexString(stateu8a)}\n`)