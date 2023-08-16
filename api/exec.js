// usage: node prove.js [--inputgen/pretest] <blocknum/blockhash> <state> -> wasm input
// TODO: add -o --outfile <file> under inputgen mode
import { genStreamAndMatchedEventOffsets } from "../common/api_helper.js";
import { loadZKGraphConfig } from "../common/config_utils.js";
import { providers } from "ethers";
import { getRawReceipts } from "../common/ethers_helper.js";
import { rlpDecodeAndEventFilter } from "../common/api_helper.js";
import {
  fromHexString,
  toHexString,
} from "../common/utils.js";
import { logReceiptAndEvents } from "../common/log_utils.js";
import { instantiateWasm } from "../common/bundle.js";

export async function execute(basePath, wasmPath, yamlPath, rpcUrl, blockid, isLocal=false, enableLog=true) {

    if (typeof blockid === "string"){
        blockid = blockid.length >= 64 ? blockid : parseInt(blockid) //e.g. 17633573
    }

    // Load config
    const [source_address, source_esigs] = loadZKGraphConfig(yamlPath);

    if (enableLog) {
        console.log("[*] Source contract address:", source_address);
        console.log("[*] Source events signatures:", source_esigs, "\n");
    }

    const provider = new providers.JsonRpcProvider(rpcUrl);

    // Fetch raw receipts
    const rawreceiptList = await getRawReceipts(provider, blockid);

    // RLP Decode and Filter
    const [filteredRawReceiptList, filteredEventList] = rlpDecodeAndEventFilter(
      rawreceiptList,
      fromHexString(source_address),
      source_esigs.map((esig) => fromHexString(esig)),
    );

    // Gen Offsets
    let [rawReceipts, matchedEventOffsets] = genStreamAndMatchedEventOffsets(
      filteredRawReceiptList,
      filteredEventList,
    );

    if (enableLog){
        // Log
        logReceiptAndEvents(
          rawreceiptList,
          blockid,
          matchedEventOffsets,
          filteredEventList,
        );
    }

    // may remove
    matchedEventOffsets = Uint32Array.from(matchedEventOffsets);

    let asmain_exported;
    if (isLocal) {
      const { asmain } = await instantiateWasm(wasmPath, basePath);
      asmain_exported = asmain;
    } else {
      const { asmain, __as_start } = await instantiateWasm(wasmPath, basePath);
      asmain_exported = asmain;
      __as_start();
    }

    // Execute zkgraph that would call mapping.ts
    let stateU8a = asmain_exported(rawReceipts, matchedEventOffsets);

    if (enableLog) {
        console.log("[+] ZKGRAPH STATE OUTPUT:", toHexString(stateU8a), "\n");
    }
    
    return stateU8a
}
