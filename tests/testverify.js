import fs from "fs";

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"

let yamlPath = "tests/testsrc/zkgraph.yaml"
// let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
let ZkwasmProviderUrl = "https://rpc.zkwasmhub.com:8090"
let proveTaskId = "650ecd68a476965e5d9524ca"

let enableLog = true

let yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath)

let result = await zkgapi.verify(
  {'wasmUint8Array': null, 'zkgraphYaml': yaml}, 
  proveTaskId, 
  ZkwasmProviderUrl, 
  enableLog
)

console.log(result)
