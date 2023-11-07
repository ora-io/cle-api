import fs from "fs";

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"

let isLocal = false
let enableLog = true
let blocknumfortest = {
    'sepolia': 2279547,
    'mainnet': 17633573
}
let zkgstatefortest = {
    'sepolia': '0xa60ecf32309539dd84f27a9563754dca818b815e',
    'mainnet': 'b4fc6d0168e52d35cacd2c6185b44281ec28c9dc'

}

// Get rawReceiptList, blockNumber, blockHash, receiptsRoot first to test proveInputGenOnRawReceipts
import { config } from "./config.js";
let rpcUrl = config.provider.sepolia;
const yamlContent =fs.readFileSync("tests/testsrc/zkgraph.yaml", "utf8");

// Test proveInputGen
let [pri, pub] = await zkgapi.proveInputGen(
    yamlContent,
    rpcUrl,
    blocknumfortest.sepolia,
    zkgstatefortest.sepolia,
    isLocal,
    enableLog)

// console.log(pri)
// console.log(pub)

const wasm = fs.readFileSync("tests/build/zkgraph_full.wasm");
const wasmUnit8Array = new Uint8Array(wasm);
let mock_succ = await zkgapi.proveMock(
        wasmUnit8Array,
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
