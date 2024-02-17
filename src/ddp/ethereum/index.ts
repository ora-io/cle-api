import { ethers } from 'ethers'
import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { KeyofToArray } from '@murongg/utils/index'
import { cle_abi } from '../../common/constants'
import type { ProofParams } from '../../types'
import { DataDestinationPlugin } from '../interface'

export interface EthereumDDPGoParams {
  signer: ethers.Wallet
  gasLimit: number
}

export class EthereumDataDestinationPlugin extends DataDestinationPlugin<EthereumDDPGoParams> {
  goParams: KeyofToArray<EthereumDDPGoParams> = ['signer']

  async go(cleId: string, proofParams: ProofParams, goParams: EthereumDDPGoParams, enableLog = false): Promise<void> {
    const proof = ZkWasmUtil.bytesToBigIntArray(proofParams.aggregate_proof)
    const instances = ZkWasmUtil.bytesToBigIntArray(proofParams.batch_instances)
    const aux = ZkWasmUtil.bytesToBigIntArray(proofParams.aux)
    const arg = ZkWasmUtil.bytesToBigIntArray(proofParams.instances)

    // try {
    const graph = new ethers.Contract(cleId, cle_abi, goParams.signer)

    const tx = await graph.trigger(proof, instances, aux, [arg], [0n], { gasLimit: goParams.gasLimit })

    if (enableLog) {
      // logger.info("transaction submitted, tx hash: " + tx.hash);
      console.log(`transaction submitted, tx hash: ${tx.hash}`)
    }
    const receipt = await tx.wait()
    // await tx.wait()
    if (enableLog) {
      // logger.info("transaction confirmed, block number: " + receipt.blockNumber);
      console.log(`transaction confirmed, block number: ${receipt.blockNumber}`)
    }
    // this.status == 'off';
    // this.senderIdx = (this.senderIdx + 1) % config.UserPrivateKey.length;
    // }
    // catch (err) {
    // logger.error(`failed to trigger for graph ${taskDetails.zkgid}`);
    // logger.error(err);
    // console.error(err)
    // this.status == 'off';
    // this.senderIdx = (this.senderIdx + 1) % config.UserPrivateKey.length;
    // }
  }
}

// const provider = new ethers.providers.JsonRpcProvider();
// const signer = new ethers.Wallet(config.UserPrivateKey[this.senderIdx], provider);
