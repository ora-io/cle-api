import {ethers} from "ethers";
import { config } from "./config.js";
import { getRawReceipts } from "../common/ethers_helper.js";

const provider = new ethers.providers.JsonRpcProvider(config.Provider.mainnet);

let res = await getRawReceipts(provider, 17967861, false)
console.log(res);