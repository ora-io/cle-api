import * as zkgapi from "../index.js"
// import * as zkgapi from "@hyperoracle/zkgraph-api"

let basePath = import.meta.url + '/../../'

import { providers } from "ethers";
import { config } from "./config.js";

let rpcUrl = config.JsonRpcProvider.sepolia;
let blocknumfortest = {
    'sepolia': 2279547,
    'mainnet': 17633573
}

const provider = new providers.JsonRpcProvider(rpcUrl);
let rawReceiptList = await zkgapi.getRawReceipts(provider, blocknumfortest.sepolia, false);
// console.log(rawReceiptList)

// let stateu8a = await zkgapi.execute(
//     basePath, 
//     'tests/build/zkgraph_local.wasm', 
//     "tests/testsrc/zkgraph.yaml", 
//     rpcUrl,
//     blocknumfortest.sepolia, 
//     true, 
//     true
// )
// console.log(stateu8a)

let stateu8a_3 = await zkgapi.executeOnRawReceipts(
    basePath, 
    'tests/build/zkgraph_local.wasm', 
    "tests/testsrc/zkgraph.yaml", 
    rawReceiptList,
    true, 
    true
)

console.log(stateu8a_3)

// let a={'a':null}
// a.a=2
// console.log(a.a)


// let stateu8a_2 = await zkgapi.execute(
//     basePath, 'tests/build/zkgraph_full.wasm', "tests/testsrc/zkgraph.yaml", 
//     rpcUrl,
//     17633573, false, true
// )

// console.log(stateu8a_2)
