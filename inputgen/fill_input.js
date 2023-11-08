import { filterEvents } from "../common/api_helper.js";
import { toHexString, trimPrefix } from "../common/utils.js";
import { Input } from "../common/input.js";
import { ZkGraphYaml } from "../type/zkgyaml.js";
import { BlockPrep } from "../type/blockprep.js";

// blockPrep: class BlockPrep, used for prepare data & interface params.
export function fillInputOneBlock(input, zkgyaml, blockPrep){

  input.addVarLenHexString(
    blockPrep.rlpHeader,
    false
  );

  /**
   * Fill storage
   * */ 

  if (zkgyaml.dataSources[0].storage) {

    let [stateDSAddrList, stateDSSlotsList] = zkgyaml.dataSources[0].storage.toArray();
    input.addInt(stateDSAddrList.length, false); // account count

    console.log("[*] Defined Data Sources - Storage:");
    for (let i = 0; i < stateDSAddrList.length; i++) {
      //TODO move log to cli
      console.log(
        "    (" + i + ") Address:",
        stateDSAddrList[i],
        "\n        Slot keys:",
        stateDSSlotsList[i],
        "\n"
      );

      input.addHexString(stateDSAddrList[i], false); // address
      // let ethproof = await getProof(
      //   provider,
      //   stateDSAddrList[i],
      //   stateDSSlotsList[i],
      //   ethers.utils.hexValue(blockNumber)
      // );

      let acctPrep = blockPrep.getAccount(stateDSAddrList[i]);

      input.addVarLenHexString(acctPrep.rlpNode, false); // account rlp
      input.addVarLenHexStringArray(acctPrep.accountProof, false); // account proof

      let sourceSlots = stateDSSlotsList[i];
      input.addInt(sourceSlots.length, false); // slot count

      for (let j = 0; j < sourceSlots.length; j++) {
        let slotPrep = acctPrep.getSlot(sourceSlots[j]);
        // slot might doesn't exist. can't proceed in this case.
        if (slotPrep.storageProof == null) {
          throw new Error(`In ExecInputGen: slot ${sourceSlots[j]} doesn't exist on given block height, storage proof == null. \n Please update yaml or use later blocknumber.`)
        }
        input.addHexString(sourceSlots[j], false);
        input.addVarLenHexString(slotPrep.value, false);
        input.addVarLenHexStringArray(slotPrep.storageProof, false);
      }
    }
  } else {
    console.log("[*] No storage DS provided, skip...")
    input.addInt(0, false); // account count
  }


  /**
   * Fill RLP(receipt)
   * */ 

  if (zkgyaml.dataSources[0].event) {

    // TODO move logs to cli
    let enableLog = true;
    
    let [eventDSAddrList, eventDSEsigsList] = zkgyaml.dataSources[0].event.toArray()

    // TODO: move this to cli
    console.log("[*] Defined Data Sources - Event:");
    for (let i = 0; i < eventDSAddrList.length; i++){
        console.log("    ("+i+") Address:", eventDSAddrList[i], '\n        Event Sigs:', eventDSEsigsList[i], "\n");
    }

  let rawreceiptList = blockPrep.getRLPReceipts();

  // TODO: return list rather than appending string.
    let [rawReceipts, matchedEventOffsets] = filterEvents(
      eventDSAddrList,
      eventDSEsigsList,
      rawreceiptList,
      enableLog
    )

    // TODO: calc receipt count from filterEvents
    input.addInt(rawreceiptList.length, false); // receipt count (tmp)

    // fill raw receipts
    input.addVarLenHexString(toHexString(rawReceipts), false);
  } else {
    console.log("[*] No event DS provided, skip...")
    input.addInt(0, false); // source contract count; meaning: no source contract
  }

  return input;
}

export function fillExecInput(
  input,
  zkgyaml,
  blockPrepMap, // Map<blocknum: i32, BlockPrep>
  blocknumOrder, // i32[]
) {
  let blockCount = blocknumOrder.length
  input.addInt(blockCount, false); // block count

  blocknumOrder.forEach(bn => {
    if (!blockPrepMap.has(bn)) {
      throw new Error(`Lack blockPrep for block (${bn})`)
    }
    fillInputOneBlock(input, zkgyaml, blockPrepMap.get(bn))
  });
  // input.addVarLenHexString(
  //   "0xf9023ba0471046357a104b659365e6cf9751fb2b82c7c57ad40ce6577187433280787a91a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347940000000000000000000000000000000000000000a0632a7359190018d7a9874f757fd3b9719bf1aa8b84c66c53027f3bda220676b0a009218adecad9f3c086e5bed1e2c42f2bf89f95042855c52d379d13acaf631ad0a0cd74a2298267317f57c3b454e39dcc20f1d5c1c02dc5ac6d33d6e81499306ccdb901002881080818140000c07854415cf181c104898088020c06008860c40200124c0208a000704940401031013802d0480880208a340254260140022101004324a222a10aa01058a23429998010388ca996009027185814a44398200a40000010a28e0fa4400cc6a24210028900a480020bd90201428020000400c1820212458284304002040512102131216004c848516580501905a0010c8c00891000808442046707188023010080222008004000000c08180ae0588a90004a00209108240a40102012000b402328560cb064051300042010602330020a06008290d7480168681292d302054091203180000602a23128044a408038201010054204a020264c50408083455e458401c9c38083b0818b846536428899d883010d01846765746888676f312e32312e31856c696e7578a083a009e788fed9edb6444cd1305367be5090da1993f8958930cd54a44ce1f8118800000000000000008516d9f2e506a0adef2eee900e520200c9d53d7b56fee4d685a3ef5391ba4beed002fe110e887d",
  //   false
  // ); // fake header rlp

  // /**
  //  * Fill storage
  //  * */ 

  // if (zkgyaml.dataSources[0].storage) {

  //   let [stateDSAddrList, stateDSSlotsList] =
  //     zkgyaml.dataSources[0].storage.toArray();
  //   input.addInt(stateDSAddrList.length, false); // account count

  //   for (let i = 0; i < stateDSAddrList.length; i++) {
  //     console.log(
  //       "    (" + i + ") Address:",
  //       stateDSAddrList[i],
  //       "\n        Slot keys:",
  //       stateDSSlotsList[i],
  //       "\n"
  //     );
  //     input.addHexString(stateDSAddrList[i], false); // address
  //     let ethproof = await getProof(
  //       provider,
  //       stateDSAddrList[i],
  //       stateDSSlotsList[i],
  //       ethers.utils.hexValue(blockNumber)
  //     );

  //     // TODO this is still fake
  //     input.addVarLenHexString("0xaaaaaa", false); // account rlp
  //     input.addVarLenHexStringArray(ethproof.accountProof, false); // account proof

  //     let sourceSlots = stateDSSlotsList[i];
  //     input.addInt(sourceSlots.length, false); // slot count

  //     for (let j = 0; j < sourceSlots.length; j++) {
  //       // slot might doesn't exist. can't proceed in this case.
  //       if (ethproof.storageProof[j].proof == null) {
  //         throw new Error(`In ExecInputGen: slot ${sourceSlots[j]} doesn't exist on given block height, storage proof == null. \n Please update yaml or blockheight.`)
  //       }
  //       input.addHexString(sourceSlots[j], false);
  //       input.addVarLenHexString(ethproof.storageProof[j].value, false);
  //       input.addVarLenHexStringArray(ethproof.storageProof[j].proof, false);
  //     }
  //   }
  // } else {
  //   input.addInt(0, false); // account count
  // }


  // /**
  //  * Fill RLP(receipt)
  //  * */ 

  // if (zkgyaml.dataSources[0].event) {
  //   // Fetch raw receipts
  //   let rawreceiptList = await getRawReceipts(provider, blockNumber).catch(
  //     (error) => {
  //       throw error;
  //     }
  //   );

  //   // TODO
  //   let enableLog = true;
    
  //   let [eventDSAddrList, eventDSEsigsList] =
  //     zkgyaml.dataSources[0].event.toArray()
  //   let [rawReceipts, matchedEventOffsets] = await filterEvents(
  //     eventDSAddrList,
  //     eventDSEsigsList,
  //     rawreceiptList,
  //     enableLog
  //   ).catch((error) => {
  //     throw error;
  //   });

  //   // TODO: calc receipt count from filterEvents
  //   input.addInt(rawreceiptList.length, false); // receipt count (tmp)

  //   // fill raw receipts
  //   input.addVarLenHexString(toHexString(rawReceipts), false);
  // } else {
  //   console.log("[*] No event DS provided.")
  //   input.addInt(0, false); // source contract count; meaning: no source contract
  // }

  return input;
}


export function fillProveInput(
  input,
  zkgyaml,
  blockPrepMap, // Map<blocknum: i32, BlockPrep>
  blocknumOrder, // i32[]
  latestBlockhash,
  expectedStateStr
) {

  expectedStateStr = trimPrefix(expectedStateStr, "0x");

  fillExecInput(
    input,
    zkgyaml,
    blockPrepMap,
    blocknumOrder, 
  )

  // Public: blockhash_latest
  input.addHexString(latestBlockhash, true);

  // for test
  // if (i === 0) {
  //   expectedStateStr = ethproof.storageProof[0].value;
  // }
  // Public: expected_state
  input.addVarLenHexString(expectedStateStr, true);

  return input;
}