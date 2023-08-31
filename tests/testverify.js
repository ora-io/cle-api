// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"

let yamlPath = "tests/testsrc/zkgraph.yaml"
let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
let proveTaskId = "64e727a6abac08978a1415f9"

let enableLog = true

let result = await zkgapi.verify(yamlPath, proveTaskId, ZkwasmProviderUrl, enableLog)

console.log(result)
