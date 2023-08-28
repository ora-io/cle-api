import * as zkgapi from "../index.js"
// import * as zkgapi from "@hyperoracle/zkgraph-api"

let basePath = import.meta.url + '/../../'

import { providers } from "ethers";
import { config } from "./config.js";

let rpcUrl = config.Provider.mainnet;

const provider = new providers.JsonRpcProvider(rpcUrl);
let rawReceiptList = await zkgapi.getRawReceipts(provider, 17633573, false);
// console.log(rawReceiptList)

// let stateu8a = await zkgapi.execute(
//     basePath, 
//     'tests/build/zkgraph_local.wasm', 
//     "tests/testsrc/zkgraph.yaml", 
//     rpcUrl,
//     17633573, 
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
