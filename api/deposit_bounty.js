import { providers, Contract, Wallet } from "ethers";
import {
  graph_abi
} from "../common/constants.js";
import {logLoadingAnimation} from "../common/log_utils.js";

/**
 * Publish and register zkGraph onchain.
 * @param {string} rpcUrl - the rpc url of the target network
 * @param {string} deployedContractAddress - the deployed verification contract address
 * @param {number} depositAmount - the deposit amount in ETH
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function deposit(
  rpcUrl,
  deployedContractAddress,
  depositAmount,
  userPrivateKey,
  enableLog = true,
) {

  const provider = new providers.JsonRpcProvider(rpcUrl);

  const wallet = new Wallet(userPrivateKey, provider);

  const graphContract = new Contract(deployedContractAddress, graph_abi, wallet);

  const tx = await graphContract
    .deposit(
      ethers.parseEther(depositAmount), { value: ethers.parseEther(depositAmount) }
    )
    .catch((err) => {
      throw err;
    });

  const signedTx = await wallet.signTransaction(tx).catch((err) => {
    throw err;
  });

  let loading;
  if (enableLog === true) {
    console.log("[*] Please wait for deposit tx... (estimated: 30 sec)", "\n");
    loading = logLoadingAnimation();
  }

  const txReceipt = await tx.wait(1).catch((err) => {
    throw err;
  });

  if (enableLog === true) {
    loading.stopAndClear();
    console.log(`[+] ZKGRAPH BOUNTY DEPOSIT COMPLETE!`, "\n");
    console.log(
      `[*] Transaction confirmed in block ${txReceipt.blockNumber}`
    );
    console.log(`[*] Transaction hash: ${txReceipt.transactionHash}`, "\n");
  }

  return txReceipt.transactionHash;
}
