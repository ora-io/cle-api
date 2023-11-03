import {
  formatVarLenInput,
  formatIntInput,
  formatHexStringInput,
} from "../common/api_helper.js";
import {
  getBlockByNumber,
  getBlockByHash,
  getRawReceipts,
  getProof,
} from "../common/ethers_helper.js";
import { filterEvents } from "../common/api_helper.js";
import { toHexString, trimPrefix } from "../common/utils.js";
import {
  loadZKGraphEventSources,
  loadZKGraphStorageSources,
} from "../common/config_utils.js";
import { Input } from "../common/input.js";
import { ethers, providers } from "ethers";

/**
 * Generate the private and public inputs in hex string format
 * @param {string} yamlContent
 * @param {string} rpcUrl
 * @param {number | string} blockid
 * @param {string} expectedStateStr
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {[string, string]} - private input string, public input string
 */
export async function proveInputGen(
  yamlContent,
  rpcUrl,
  blockid,
  expectedStateStr,
  isLocal = false,
  enableLog = true
) {
  const provider = new providers.JsonRpcProvider(rpcUrl);

  // Get block
  let block;
  if (
    typeof blockid === "string" &&
    blockid.length == 66 &&
    blockid.charAt(0) == "0" &&
    blockid.charAt(1) == "x"
  ) {
    block = await getBlockByHash(provider, blockid).catch((error) => {
      throw error;
      // console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
      // process.exit(1);
    });
  } else {
    block = await getBlockByNumber(provider, blockid).catch((error) => {
      throw error;
      // console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
      // process.exit(1);
    });
  }

  const blockNumber = parseInt(block.number);
  const blockHash = block.hash;
  const receiptsRoot = block.receiptsRoot;

  // Fetch raw receipts
  const rawreceiptList = await getRawReceipts(provider, blockid).catch(
    (error) => {
      throw error;
    }
  );

  if (enableLog) {
    console.log("[*] Run zkgraph on block:", blockid, "\n");
  }

  return await proveInputGenOnRawReceipts(
    yamlContent,
    rawreceiptList,
    blockNumber,
    blockHash,
    receiptsRoot,
    expectedStateStr,
    isLocal,
    enableLog
  );
}

export async function proveInputGenOnRawReceipts(
  yamlContent,
  rawreceiptList,
  blockNumber,
  blockHash,
  receiptsRoot,
  expectedStateStr,
  isLocal = false,
  enableLog = true
) {
  expectedStateStr = trimPrefix(expectedStateStr, "0x");

  const [sourceAddressList, sourceEsigsList] =
    loadZKGraphEventSources(yamlContent);
  const [rawReceipts, matchedEventOffsets] = await filterEvents(
    sourceAddressList,
    sourceEsigsList,
    rawreceiptList,
    enableLog
  ).catch((error) => {
    throw error;
  });

  // Declare inputs
  let privateInputStr, publicInputStr;

  // Set value for inputs
  if (isLocal) {
    // Generate inputs
    privateInputStr =
      formatVarLenInput(toHexString(rawReceipts)) +
      formatVarLenInput(
        toHexString(new Uint8Array(matchedEventOffsets.buffer))
      );
    publicInputStr = formatVarLenInput(expectedStateStr);
  } else {
    // Generate inputs
    publicInputStr =
      formatIntInput(blockNumber) +
      formatHexStringInput(blockHash) +
      formatVarLenInput(expectedStateStr);
    privateInputStr =
      formatVarLenInput(toHexString(rawReceipts)) +
      formatHexStringInput(receiptsRoot);
  }

  //   if (enableLog){
  //     console.log("[+] ZKGRAPH STATE OUTPUT:", expectedStateStr, "\n");
  //     console.log("[+] PRIVATE INPUT FOR ZKWASM:", "\n" + privateInputStr, "\n");
  //     console.log("[+] PUBLIC INPUT FOR ZKWASM:", "\n" + publicInputStr, "\n");
  //   }
  return [privateInputStr, publicInputStr];
}

export async function proveInputGenOnStorages(
  provider,
  yamlContent,
  blockNumber,
  blockHash,
  expectedStateStr
) {
  expectedStateStr = trimPrefix(expectedStateStr, "0x");
  let input = new Input();
  input.addInt(1, false); // block count
  input.addVarLenHexString(
    "0xf9023ba0471046357a104b659365e6cf9751fb2b82c7c57ad40ce6577187433280787a91a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347940000000000000000000000000000000000000000a0632a7359190018d7a9874f757fd3b9719bf1aa8b84c66c53027f3bda220676b0a009218adecad9f3c086e5bed1e2c42f2bf89f95042855c52d379d13acaf631ad0a0cd74a2298267317f57c3b454e39dcc20f1d5c1c02dc5ac6d33d6e81499306ccdb901002881080818140000c07854415cf181c104898088020c06008860c40200124c0208a000704940401031013802d0480880208a340254260140022101004324a222a10aa01058a23429998010388ca996009027185814a44398200a40000010a28e0fa4400cc6a24210028900a480020bd90201428020000400c1820212458284304002040512102131216004c848516580501905a0010c8c00891000808442046707188023010080222008004000000c08180ae0588a90004a00209108240a40102012000b402328560cb064051300042010602330020a06008290d7480168681292d302054091203180000602a23128044a408038201010054204a020264c50408083455e458401c9c38083b0818b846536428899d883010d01846765746888676f312e32312e31856c696e7578a083a009e788fed9edb6444cd1305367be5090da1993f8958930cd54a44ce1f8118800000000000000008516d9f2e506a0adef2eee900e520200c9d53d7b56fee4d685a3ef5391ba4beed002fe110e887d",
    false
  ); // fake header rlp

  const [sourceAddressList, sourceSlotsList] =
    loadZKGraphStorageSources(yamlContent);
  input.addInt(sourceAddressList.length, false); // account count

  for (let i = 0; i < sourceAddressList.length; i++) {
    console.log(
      "    (" + i + ") Address:",
      sourceAddressList[i],
      "\n        Slot keys:",
      sourceSlotsList[i],
      "\n"
    );
    input.addHexString(sourceAddressList[i], false); // address
    const ethproof = await getProof(
      provider,
      sourceAddressList[i],
      sourceSlotsList[i],
      ethers.utils.hexValue(blockNumber)
    );

    // TODO this is still fake
    input.addVarLenHexString("0xaaaaaa", false); // account rlp
    input.addVarLenHexStringArray(ethproof.accountProof, false); // account proof

    let sourceSlots = sourceSlotsList[i];
    input.addInt(sourceSlots.length, false); // slot count

    for (let j = 0; j < sourceSlots.length; j++) {
      input.addHexString(sourceSlots[j], false);
      input.addVarLenHexString(ethproof.storageProof[j].value, false);
      input.addVarLenHexStringArray(ethproof.storageProof[j].proof, false);
    }
  }
  // expected_state
  input.addVarLenHexString(expectedStateStr, true);
  // blockhash_latest
  input.addHexString(blockHash, true);
  return [input.getPrivateInputStr(), input.getPublicInputStr()];
}
