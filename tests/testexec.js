import fs from "fs";

import * as zkgapi from "../index.js";

import { config } from "./config.js";

let rpcUrl = config.provider.sepolia;
let blocknumfortest = {
  sepolia: 2279547,
  mainnet: 17633573,
};

const wasm = fs.readFileSync("tests/build/zkgraph_local.wasm");
const wasmUnit8Array = new Uint8Array(wasm);
const yamlContent = fs.readFileSync("tests/testsrc/zkgraph.yaml", "utf8");

let stateu8a = await zkgapi.execute(
  wasmUnit8Array,
  yamlContent,
  rpcUrl,
  blocknumfortest.sepolia,
  true,
  true
);

console.log(stateu8a);
