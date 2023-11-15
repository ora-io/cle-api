import fs from "fs";

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"

let yamlPath = "tests/testsrc/zkgraph-event.yaml"
// let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
let ZkwasmProviderUrl = "https://rpc.zkwasmhub.com:8090"
let proveTaskId = "6554584c82ab2c8b29dbc2c2"

let yaml = zkgapi.ZkGraphYaml.fromYamlPath(yamlPath)

let result = await zkgapi.verify(
  {'wasmUint8Array': null, 'zkgraphYaml': yaml}, 
  proveTaskId, 
  ZkwasmProviderUrl
)

console.log(result)
