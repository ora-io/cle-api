// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"

let isLocal = true
let enableLog = true
let blockid = 17633573
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
let rawReceiptList = await zkgapi.getRawReceipts(provider, blockid);
// Get block
const simpleblock = await provider.getBlock(blockid).catch(() => {
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

let [pri, pub] = await zkgapi.proveInputGenOnRawReceipts(
    "tests/testsrc/zkgraph.yaml", 
    rawReceiptList, 
    blockNumber,
    blockHash,
    receiptsRoot,
    'b4fc6d0168e52d35cacd2c6185b44281ec28c9dc',
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


// let [err, result] = await zkgapi.prove(
//     'tests/build/zkgraph_local.wasm', 
//     pri,
//     pub,
//     "https://zkwasm-explorer.delphinuslab.com:8090",
//     config.SignerSecretKey,
//     !enableLog)

// console.log('error:', err)
// console.log('result:', result)