import { filterEvents } from "../../common/api_helper.js";
import { toHexString, trimPrefix } from "../../common/utils.js";

export function fillInputBlocks(
  input,
  zkgyaml,
  blockPrepMap, // Map<blocknum: i32, BlockPrep>
  blocknumOrder, // i32[]
  latestBlockhash
) {
  let blockCount = blocknumOrder.length
  input.addInt(blockCount, false); // block count

  blocknumOrder.forEach(bn => {
    if (!blockPrepMap.has(bn)) {
      throw new Error(`Lack blockPrep for block (${bn})`)
    }
    fillInputOneBlock(input, zkgyaml, blockPrepMap.get(bn))
  });

  // Optional but easy to handle;
  // Public: blockhash_latest
  input.addHexString(latestBlockhash, true);

  return input;
}

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
    let receiptCount = rawReceipts.length > 0 ? rawreceiptList.length : 0
    input.addInt(receiptCount, false); // receipt count (tmp)

    if (receiptCount > 0) {
      // fill raw receipts
      input.addVarLenHexString(toHexString(rawReceipts), false);
    }
  } else {
    console.log("[*] No event DS provided, skip...")
    input.addInt(0, false); // source contract count; meaning: no source contract
  }

  return input;
}
