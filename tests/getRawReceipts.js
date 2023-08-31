import {ethers} from "ethers";
import { config } from "./config.js";
// import * as zkgapi from "../index.js"
import * as zkgapi from "@hyperoracle/zkgraph-api"

const provider = new ethers.providers.JsonRpcProvider(config.Provider.mainnet);

let res = await zkgapi.getRawReceipts(provider, 17967861, false)
console.log(res);