import {
  waitTaskStatus,
} from "../requests/zkwasm_taskdetails.js";
import {zkwasm_imagedetails} from "../requests/zkwasm_imagedetails.js";
import {
  getTargetNetwork,
  parseArgs
} from "../common/utils.js";
import { ZkWasmUtil } from "@hyperoracle/zkwasm-service-helper";
import Web3EthContract from "web3-eth-contract";
import { verifier_abi } from "../common/constants.js";

/**
 * Verify zk proof onchain.
 * @param {string} yamlContent
 * @param {string} proveTaskId
 * @param {string} ZkwasmProviderUrl
 * @param {boolean} enableLog
 * @returns {boolean} - true if verification success, false otherwise.
 */
export async function verify(
  zkGraphExecutable,
  proveTaskId,
  ZkwasmProviderUrl,
  enableLog = true
) {
  const { zkgraphYaml } = zkGraphExecutable;

  let verificationResult;

  const networkName = zkgraphYaml.dataDestinations[0].network;
  const targetNetwork = getTargetNetwork(networkName);

  // Check task status of prove.
  const taskDetails = await waitTaskStatus(ZkwasmProviderUrl, proveTaskId, ["Done", "Fail"], 3000, 0).catch((err) => {
    throw err;
  })
   //TODO: timeout
  if (taskDetails.status !== "Done") {
    if (enableLog === true) console.log("[-] PROVE TASK IS NOT DONE. EXITING...", "\n");
    verificationResult = false;
  }

  // Get deployed contract address of verification contract.
  const imageId = taskDetails.md5;
  const [imageStatus, error] = await zkwasm_imagedetails(ZkwasmProviderUrl, imageId).catch((err) => {
    throw err;
  });
  const imageDeployment = imageStatus.data.result[0].deployment;
  const deployedContractInfo = imageDeployment.find(
    (x) => x.chain_id === targetNetwork.value
  );
  if (!deployedContractInfo) {
    if (enableLog === true) {
      console.log(
      `[-] DEPLOYED CONTRACT ADDRESS ON TARGET NETWORK IS NOT FOUND. EXITING...`,
      "\n"
      );
    }
    verificationResult = false;
  }
  const deployedContractAddress = deployedContractInfo.address;

  // Inputs for verification
  const instances = ZkWasmUtil.bytesToBN(taskDetails.batch_instances);
  const proof = ZkWasmUtil.bytesToBN(taskDetails.proof);
  const aux = ZkWasmUtil.bytesToBN(taskDetails.aux);
  let arg = parseArgs(taskDetails.public_inputs).map((x) => x.toString(10));
  if (arg.length === 0) arg = [0];

  if (targetNetwork.value === 5) {
    Web3EthContract.setProvider("https://rpc.ankr.com/eth_goerli");
  }
  if (targetNetwork.value === 11155111) {
    Web3EthContract.setProvider("https://rpc2.sepolia.org");
  }
  let contract = new Web3EthContract(verifier_abi.abi, deployedContractAddress);

  const result = await contract.methods
    .verify(proof, instances, aux, [arg])
    .call()
    .catch((err) => {
      throw err;
    });

  if (verificationResult !== false) {
    if (enableLog === true) console.log(`[+] VERIFICATION SUCCESS!`, "\n");
    verificationResult = true;
  }

  return verificationResult;
}
