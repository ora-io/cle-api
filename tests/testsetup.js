// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"
import { config } from "./config.js";

let [err, result] = await zkgapi.setup('tests/build/zkgraph_local.wasm', 20, config.SignerSecretKey, "https://zkwasm-explorer.delphinuslab.com:8090", true, false);

console.log(err)
console.log(result)