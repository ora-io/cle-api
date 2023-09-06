// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"
import { config } from "./config.js";

let result = await zkgapi.setup('tests/build/zkgraph_full copy.wasm', 22, config.SignerSecretKey, "https://zkwasm-explorer.delphinuslab.com:8090", true, true);

console.log(result)