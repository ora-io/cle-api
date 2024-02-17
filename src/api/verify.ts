import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { providers } from 'ethers'
import { Contract } from 'ethers'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { AggregatorVerifierABI } from '../common/constants'
import { ProveTaskNotReady } from '../common/error'
import type { ProofParams as VerifyProofParams } from '../types/api'
// import { VerifyProofParams } from '@ora-io/zkwasm-service-helper'

export interface OnchainVerifier {
  provider: providers.JsonRpcProvider
  verifierAddress: string
}

export type VerifyOptions = OnchainVerifier

export async function verify(
  verifyParams: VerifyProofParams,
  options: VerifyOptions,
  // jsonRpcProviderUrl: string,
) {
  return await verifyOnchain(verifyParams, options)
}

/**
 * Verify zk proof with eth call.
 * @param verifyParams
 * @param options
 * @returns
 */
export async function verifyOnchain(
  verifyParams: VerifyProofParams,
  options: OnchainVerifier,
  // jsonRpcProviderUrl: string,
) {
  const proof = ZkWasmUtil.bytesToBigIntArray(verifyParams.aggregate_proof)
  const instances = ZkWasmUtil.bytesToBigIntArray(verifyParams.batch_instances)
  const aux = ZkWasmUtil.bytesToBigIntArray(verifyParams.aux)
  const arg = ZkWasmUtil.bytesToBigIntArray(verifyParams.instances)

  const { verifierAddress, provider } = options
  // Web3EthContract.setProvider(jsonRpcProviderUrl)

  // const contract = new Web3EthContract(AggregatorVerifierABI.abi as any, verifierContractAddress)
  const contract = new Contract(verifierAddress, AggregatorVerifierABI.abi as any, provider)

  let verificationResult = true
  // verify success if no err throw
  await contract
    .verify(proof, instances, aux, [arg])
    .catch((err: any) => {
      if (err.message.startsWith('call revert exception;'))
        verificationResult = false
      else
        throw err
    })

  //   console.log('tx', tx)
  // await tx.wait(1).catch((err: any) => {
  //   throw err
  // })

  // let verificationResult = true
  // // verify success if no err throw
  // await contract.methods
  //   .verify(proof, instances, aux, [arg])
  //   .call()
  //   .catch((err: any) => {
  //     if (err.message.startsWith('Returned error: execution reverted'))
  //       verificationResult = false

  //     else
  //       throw err
  //   })

  return verificationResult
}

export async function getVerifyProofParamsByTaskID(
  proveTaskId: string,
  ZkwasmProviderUrl: string,
) {
  // Check task status of prove.
  const task = await waitTaskStatus(ZkwasmProviderUrl, proveTaskId, ['Done', 'Fail'], 3000, 0).catch((err) => {
    throw err
  })

  // TODO: timeout
  if (task.status !== 'Done')
    throw new ProveTaskNotReady('Prove task is not \'Done\', can\'t verify')
    // Inputs for verification
  const proofParams: VerifyProofParams = {
    aggregate_proof: task.proof,
    batch_instances: task.batch_instances,
    aux: task.aux,
    instances: task.instances,
  }

  return proofParams
}

// TODO: read proof from local file rather than the zkwasm server (but need compitable to ho node)
export async function getVerifyProofParamsByFile(
  _proofFileName: string,
) {
  throw new Error('not implemented.')
}
