import { ethers } from 'ethers'

// import * as zkgapi from "@hyperoracle/zkgraph-api"
import * as zkgapi from "../index.js";

let rpcUrl = "https://rpc.ankr.com/eth_sepolia";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
let userPrivateKey = "";
const signer = new ethers.Wallet(userPrivateKey, provider);
let zkgraphYaml = zkgapi.ZkGraphYaml.fromYamlPath("tests/testsrc/zkgraph-dirty.yaml")
let contractAddress = "0x1B17C66e37CB33202Fd1C058fa1B97e36b7e517D";
let ipfsHash = "111";
let newBountyRewardPerTrigger = 0;
const publishTxHash = await zkgapi.publish(
  { wasmUint8Array: null, zkgraphYaml },
  provider,
  contractAddress,
  ipfsHash,
  newBountyRewardPerTrigger,
  signer,
  true
);
console.log(publishTxHash);
