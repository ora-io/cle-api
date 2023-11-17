import {
  getBlockByNumber,
  getBlockByHash,
  getRawReceipts,
  getProof,
  getBlock,
} from "../../common/ethers_helper.js";
import { filterEvents } from "../../common/api_helper.js";
import { toHexString, trimPrefix } from "../../common/utils.js";
import { ethers, providers } from "ethers";
import { ZkGraphYaml } from "../../type/zkgyaml.js";
import { BlockPrep } from "./blockprep.js";
import { EthereumDataPrep } from "./blockprep.js";


export async function prepareBlocksByYaml(provider, latestBlocknumber, latestBlockhash, expectedStateStr, zkgraphYaml) {
  // TODO: multi blocks
  let blockPrep = await prepareOneBlockByYaml(provider, latestBlocknumber, zkgraphYaml);

  let blockPrepMap = new Map();
  blockPrepMap.set(latestBlocknumber, blockPrep)

  let blocknumOrder = [latestBlocknumber]

  return new EthereumDataPrep(blockPrepMap, blocknumOrder, latestBlockhash, expectedStateStr)
}

export async function prepareOneBlockByYaml(provider, blockNumber, zkgraphYaml) {

  let stateDSAddrList, stateDSSlotsList;
  if (zkgraphYaml.getFilteredSourcesByKind('ethereum')[0].storage) {
    [stateDSAddrList, stateDSSlotsList] = zkgraphYaml.getFilteredSourcesByKind('ethereum')[0].storage.toArray();
  } else {
    [stateDSAddrList, stateDSSlotsList] = [[], []]
  }

  let needRLPReceiptList = zkgraphYaml.getFilteredSourcesByKind('ethereum')[0].event != null;

  return await prepareOneBlock(provider, blockNumber, stateDSAddrList, stateDSSlotsList, needRLPReceiptList)
}

export async function prepareOneBlock(provider, blockNumber, stateDSAddrList, stateDSSlotsList, needRLPReceiptList) {
  // let [stateDSAddrList, stateDSSlotsList] = [stateDSAddrList, stateDSSlotsList]

  let block = new BlockPrep(
    blockNumber,
    // header rlp
    "0xf9023ba0471046357a104b659365e6cf9751fb2b82c7c57ad40ce6577187433280787a91a01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347940000000000000000000000000000000000000000a0632a7359190018d7a9874f757fd3b9719bf1aa8b84c66c53027f3bda220676b0a009218adecad9f3c086e5bed1e2c42f2bf89f95042855c52d379d13acaf631ad0a0cd74a2298267317f57c3b454e39dcc20f1d5c1c02dc5ac6d33d6e81499306ccdb901002881080818140000c07854415cf181c104898088020c06008860c40200124c0208a000704940401031013802d0480880208a340254260140022101004324a222a10aa01058a23429998010388ca996009027185814a44398200a40000010a28e0fa4400cc6a24210028900a480020bd90201428020000400c1820212458284304002040512102131216004c848516580501905a0010c8c00891000808442046707188023010080222008004000000c08180ae0588a90004a00209108240a40102012000b402328560cb064051300042010602330020a06008290d7480168681292d302054091203180000602a23128044a408038201010054204a020264c50408083455e458401c9c38083b0818b846536428899d883010d01846765746888676f312e32312e31856c696e7578a083a009e788fed9edb6444cd1305367be5090da1993f8958930cd54a44ce1f8118800000000000000008516d9f2e506a0adef2eee900e520200c9d53d7b56fee4d685a3ef5391ba4beed002fe110e887d",
  )
  
  /**
   * prepare storage data
   */

  for (let i = 0; i < stateDSAddrList.length; i++) {
    // request
    let ethproof = await getProof(
      provider,
      stateDSAddrList[i],
      stateDSSlotsList[i],
      ethers.utils.hexValue(blockNumber)
    );
    // record
    block.addFromGetProofResult(ethproof, "0xaaaaaa")
  }

  /**
   * prepare raw receipts data
   */
  if (needRLPReceiptList) {
    let rawreceiptList = await getRawReceipts(provider, blockNumber).catch(
      (error) => {
        throw error;
      }
    );
  
    block.addRLPReceipts(rawreceiptList)
  }

  return block;
}
