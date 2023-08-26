import { providers, Contract, Wallet } from "ethers";
import {
  addressFactory,
  abiFactory,
  AddressZero,
} from "../common/constants.js";
import {loadZKGraphDestinations} from "../common/config_utils.js";

/**
 * Publish and register zkGraph onchain.
 * @param {string} yamlPath - the relative path to the yaml file
 * @param {string} deployedContractAddress - the deployed verification contract address
 * @param {string} ipfsHash - the ipfs hash of the zkGraph
 * @param {number} bountyRewardPerTrigger - the bounty reward per trigger in ETH
 * @param {string} userPrivateKey - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function publish(
  yamlPath,
  deployedContractAddress,
  ipfsHash,
  bountyRewardPerTrigger,
  userPrivateKey,
  enableLog = true,
) {
  const networkName = loadZKGraphDestinations(yamlPath)[0].network;
  const destinationContractAddress = loadZKGraphDestinations(yamlPath)[0].destination.address;

  const provider = new providers.getDefaultProvider(
    networkName
  );

  const wallet = new Wallet(userPrivateKey, provider);

  const factoryContract = new Contract(addressFactory, abiFactory, wallet);

  const tx = await factoryContract
    .registry(
      AddressZero,
      bountyRewardPerTrigger,
      deployedContractAddress,
      destinationContractAddress,
      ipfsHash
    )
    .catch((err) => {
      if (enableLog === true) console.log(`[-] ERROR WHEN CONSTRUCTING TX: ${err}`, "\n");
      return "";
    });

  const signedTx = await wallet.signTransaction(tx).catch((err) => {
    if (enableLog === true) console.log(`[-] ERROR WHEN SIGNING TX: ${err}`, "\n");
    return "";
  });

  const txReceipt = await tx.wait(1).catch((err) => {
    if (enableLog === true) console.log(`[-] ERROR WHEN WAITING FOR TX: ${err}`, "\n");
    return "";
  });

  if (enableLog === true) {
    console.log(`[+] ZKGRAPH PUBLISHED SUCCESSFULLY!`, "\n");
    console.log(
      `[*] Transaction confirmed in block ${txReceipt.blockNumber} on ${networkName}`
    );
    console.log(`[*] Transaction hash: ${txReceipt.transactionHash}`, "\n");
  }

  return txReceipt.transactionHash;
}
