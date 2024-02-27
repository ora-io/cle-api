import { ethers } from 'ethers'
import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { KeyofToArray } from '@murongg/utils/index'
import { cleContractABI } from '../../common/constants'
import type { ProofParams } from '../../types'
import { DataDestinationPlugin } from '../interface'
import { logger } from '../../common'

export interface EthereumDDPGoParams {
  signer: ethers.Wallet
  gasLimit: number
  onlyMock: boolean
}

export class EthereumDataDestinationPlugin extends DataDestinationPlugin<EthereumDDPGoParams> {
  goParams: KeyofToArray<EthereumDDPGoParams> = ['signer', 'gasLimit']

  async go(cleId: string, proofParams: ProofParams, goParams: EthereumDDPGoParams): Promise<void> {
    const proof = ZkWasmUtil.bytesToBigIntArray(proofParams.aggregate_proof)
    const instances = ZkWasmUtil.bytesToBigIntArray(proofParams.batch_instances)
    const aux = ZkWasmUtil.bytesToBigIntArray(proofParams.aux)
    // const arg = ZkWasmUtil.bytesToBigIntArray(proofParams.instances)
    const arg = proofParams.instances.map((ins) => { return ZkWasmUtil.bytesToBigIntArray(ins) })
    // const arg = decode2DProofParam(proofParams.instances)
    const extra = proofParams.extra ? ZkWasmUtil.bytesToBigIntArray(proofParams.extra) : [0n]
    // TODO: double check: decoded extra should be uint256[blocknum1, blocknum2]

    // try {
    const cleSC = new ethers.Contract(cleId, cleContractABI, goParams.signer)

    const callparams = [proof, instances, aux, arg, extra, { gasLimit: goParams.gasLimit }]

    // throw err if execution revert
    await cleSC.callStatic.trigger(...callparams)

    if (goParams.onlyMock)
      return

    // send tx if passed local test
    const tx = await cleSC.trigger(...callparams)

    // logger.info("transaction submitted, tx hash: " + tx.hash);
    logger.log(`transaction submitted, tx hash: ${tx.hash}`)
    const receipt = await tx.wait()
    // await tx.wait()
    // logger.info("transaction confirmed, block number: " + receipt.blockNumber);
    logger.log(`transaction confirmed, block number: ${receipt.blockNumber}`)
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
