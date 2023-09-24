import { ethers } from "ethers";

import * as zkgapi from "../index.js"


// frontend
// const provider = new ethers.providers.Web3Provider(window.ethereum)
// await provider.send("eth_requestAccounts", []);
// const signer = provider.getSigner()

const queryAPI = "http://127.0.0.1:3000";
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const feeInWei = ethers.utils.parseEther("0.1");
const rpcUrl = "http://127.0.0.1:8545";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const privateKey = "YOUR_PRIVATE_KEY";
const signer = new ethers.Wallet(privateKey, provider);

const dispatcher = new zkgapi.taskDispatch(queryAPI, contractAddress, feeInWei, provider, signer);
const tx = await dispatcher.setup('zkgraph', 22);
await tx.wait();

const txhash = tx.hash;
console.log(txhash);

const taskID = await dispatcher.queryTask(txhash);
console.log(taskID);
