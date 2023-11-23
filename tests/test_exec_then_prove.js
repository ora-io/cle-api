import fs from "fs";

import * as zkgapi from "../index.js";

import { config } from "./config.js";

const blocknumfortest = {
  sepolia: 2279547, // to test event use 2279547, to test storage use latest blocknum
  mainnet: 17633573,
};

let generalParams = {
  'jsonRpcUrl': config.JsonRpcProviderUrl.sepolia,
  'blockId': blocknumfortest.sepolia,
}

const testOptions = {
  'generalParams': generalParams,
  'wasmPath': "tests/build/zkgraph-event.wasm",
  'yamlPath': "tests/testsrc/zkgraph-event.yaml",
  'local': false,
  'zkwasmUrl': "https://rpc.zkwasmhub.com:8090", 
}

async function test_exec_then_prove(options) {
  let { wasmPath, yamlPath, generalParams, local } = options
  
  /**
   * assemble zkGraphExecutable & get dsp
   */

  // get wasmUint8Array & Yaml
  const wasm = fs.readFileSync(wasmPath)
  const wasmUint8Array = new Uint8Array(wasm)
  // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
  let yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath)

  let zkGraphExecutable =  {'wasmUint8Array': wasmUint8Array, 'zkgraphYaml': yaml}

  // get dsp
  let dsp = zkgapi.dspHub.getDSPByYaml(yaml, {'isLocal':false})
  

  /**
   * Execute
   */

  // get exec params
  const execParams = dsp.toExecParams(generalParams)
  
  // Prepare Data, can construct your own dataPrep based on this.
  // the actual dataPrep here is instance of zkgapi.ETHDSP.EthereumDataPrep
  let dataPrep = await dsp.prepareData(yaml, await dsp.toPrepareParamsFromExecParams(execParams))

  const stateu8a = await zkgapi.executeOnDataPrep(
    {'wasmUint8Array': wasmUint8Array, 'zkgraphYaml': yaml},
    dataPrep,
    local,
    true,
  )

  let stateStr = zkgapi.utils.toHexString(stateu8a)

  // /**
  //  * the 2nd way to exec get state.
  //  * gen private/public input (without expectedState)
  //  */ 
  // let input = new zkgapi.Input();
  // input = dsp.fillExecInput(input, yaml, dataPrep)
  // let [privateInputStr, publicInputStr] = [input.getPrivateInputStr(), input.getPublicInputStr()];

  // console.log(`(Execute) Private Input: ${privateInputStr}`)
  // console.log(`(Execute) Public Input: ${publicInputStr}`)

  // // execute, get state
  // const state = await zkgapi.executeOnInputs(zkGraphExecutable, privateInputStr, publicInputStr)

  console.log(`ZKGRAPH STATE OUTPUT: ${stateStr}`)

  /**
   * Prove Input Gen
   */

  dataPrep = dsp.toProveDataPrep(dataPrep, stateStr);
  let [privateInputStr, publicInputStr] = zkgapi.proveInputGenOnDataPrep(zkGraphExecutable, dataPrep)

  console.log(`(Prove) Private Input: ${privateInputStr}`)
  console.log(`(Prove) Public Input: ${publicInputStr}`)

  // /**
  //  * actual prove
  //  */ 

  // const { zkwasmUrl } = options;
  // const sk = '0x....'
  // zkgapi.prove(zkGraphExecutable, privateInputStr, publicInputStr, zkwasmUrl, sk);
}

await test_exec_then_prove(testOptions)