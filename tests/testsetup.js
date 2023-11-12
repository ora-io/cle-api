import fs from "fs";

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"
import { config } from "./config.js";

const wasm = fs.readFileSync("tests/build/zkgraph_full.wasm");
const wasmUint8Array = new Uint8Array(wasm);
let result = await zkgapi.setup('poc.wasm', wasmUint8Array, 22, config.UserPrivateKey, "https://zkwasm-explorer.delphinuslab.com:8090", true, true);

console.log(result)
