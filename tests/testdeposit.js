import fs from "fs";

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js"

let enableLog = true;
let rpcUrl = "https://eth-sepolia.g.alchemy.com/v2/your-api-key";
let deployedContractAddress = "0x870ef9B5DcBB6F71139a5f35D10b78b145853e69";
let depositAmount = "0.001";
let userPrivateKey = "0x{}";
let result = await zkgapi.deposit(rpcUrl, deployedContractAddress, depositAmount, userPrivateKey, enableLog);

console.log(result)
