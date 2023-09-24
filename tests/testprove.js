import fs from "fs";

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"

let isLocal = true
let enableLog = true
let blocknumfortest = {
    'sepolia': 2279547,
    'mainnet': 17633573
}
let zkgstatefortest = {
    'sepolia': '0xa60ecf32309539dd84f27a9563754dca818b815e',
    'mainnet': 'b4fc6d0168e52d35cacd2c6185b44281ec28c9dc'
    
}

// let [pri, pub] = await zkgapi.proveInputGen(
//     "tests/testsrc/zkgraph.yaml", 
//     rpcUrl,
//     17633573, 
//     'b4fc6d0168e52d35cacd2c6185b44281ec28c9dc',
//     isLocal, 
//     enableLog)

// Get rawReceiptList, blockNumber, blockHash, receiptsRoot first to test proveInputGenOnRawReceipts
import { config } from "./config.js";
let rpcUrl = config.JsonRpcProvider.sepolia;

import { providers } from "ethers";
import { getBlockByNumber } from "../common/ethers_helper.js";

const provider = new providers.JsonRpcProvider(rpcUrl);
let rawReceiptList = await zkgapi.getRawReceipts(provider, blocknumfortest.sepolia);
// Get block
const simpleblock = await provider.getBlock(blocknumfortest.sepolia).catch(() => {
    console.err("[-] ERROR: Failed to getBlock()", "\n");
    process.exit(1);
  });
  const block = await getBlockByNumber(provider, simpleblock.number).catch(
    () => {
      console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
      process.exit(1);
    },
  );
const blockNumber = parseInt(block.number);
const blockHash = block.hash;
const receiptsRoot = block.receiptsRoot;
// console.log(blockHash)
// console.log(receiptsRoot)

const yamlContent =fs.readFileSync("tests/testsrc/zkgraph.yaml", "utf8");
let [pri, pub] = await zkgapi.proveInputGenOnRawReceipts(
    yamlContent,
    rawReceiptList, 
    blockNumber,
    blockHash,
    receiptsRoot,
    zkgstatefortest.sepolia,
    isLocal, 
    enableLog)

// console.log(pri)
// console.log(pub)

let basePath = import.meta.url + '/../../'

let mock_succ = await zkgapi.proveMock(
        basePath,
        'tests/build/zkgraph_local.wasm', 
        pri,
        pub)

console.log('mock succ:', mock_succ)


// const wasm = fs.readFileSync("tests/build/zkgraph_local.wasm");
// const wasmUnit8Array = new Uint8Array(wasm);

// let [err, result] = await zkgapi.prove(
//     wasmUnit8Array, 
//     pri,
//     pub,
//     "https://zkwasm-explorer.delphinuslab.com:8090",
//     config.SignerSecretKey,
//     !enableLog)

// console.log('error:', err)
// console.log('result:', result)