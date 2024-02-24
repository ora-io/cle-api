import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { providers } from 'ethers'
import { Contract } from 'ethers'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { AggregatorVerifierABI, AggregatorVerifierAddress } from '../common/constants'
import { ProveTaskNotReady } from '../common/error'
import type { ProofParams as VerifyProofParams } from '../types/api'
import type { BatchOption } from './setup'
import { BatchStyle } from './setup'
// import { VerifyProofParams } from '@ora-io/zkwasm-service-helper'

export interface OnchainVerifier {
  provider: providers.JsonRpcProvider
  verifierAddress?: string
  isZKVerifier?: boolean // vs. CLEVerifier
}

export type VerifyOptions = OnchainVerifier & BatchOption

export async function verify(
  verifyParams: VerifyProofParams,
  options: VerifyOptions,
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
  options: VerifyOptions,
) {
  const { batchStyle = BatchStyle.ZKWASMHUB, isZKVerifier = true } = options
  if (isZKVerifier === false)
    throw new Error('isZKVerifier==false is reserved, not supported yet')
  const { provider } = options
  const defaultVerifierAddress
    = batchStyle === BatchStyle.ORA
      ? AggregatorVerifierAddress.Ora[provider.network.name]
      : AggregatorVerifierAddress.ZKWASMHUB[provider.network.name]

  const { verifierAddress = defaultVerifierAddress } = options

  const proof = ZkWasmUtil.bytesToBigIntArray(verifyParams.aggregate_proof)
  const instances = ZkWasmUtil.bytesToBigIntArray(verifyParams.batch_instances)
  const aux = ZkWasmUtil.bytesToBigIntArray(verifyParams.aux)
  // const arg = ZkWasmUtil.bytesToBigIntArray(verifyParams.instances)
  // TODO: cli compatible
  const arg = verifyParams.instances.map((ins) => { return ZkWasmUtil.bytesToBigIntArray(ins) })
  const extra = verifyParams.extra ? ZkWasmUtil.bytesToBigIntArray(verifyParams.extra) : undefined

  if (batchStyle === BatchStyle.ORA && extra === undefined)
    throw new Error('missing \'extra\' params under ORA batch style')

  const verifyCallParam
  // = batchStyle === BatchStyle.ORA
    = isZKVerifier
      ? [proof, instances, aux, arg] // ZKVerifier doesn't care extra
      : [proof, instances, aux, arg, extra] // CLEVerifier needs extra

  // Web3EthContract.setProvider(jsonRpcProviderUrl)
  // const contract = new Web3EthContract(AggregatorVerifierABI.abi as any, verifierContractAddress)
  const contract = new Contract(verifierAddress, AggregatorVerifierABI.abi as any, provider)

  let verificationResult = true
  // verify success if no err throw

  await contract
    .verify(...verifyCallParam)
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
  proverUrl: string,
) {
  // Check task status of prove.
  const task = await waitTaskStatus(proverUrl, proveTaskId, ['Done', 'Fail'], 3000, 0).catch((err) => {
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
    extra: task?.extra,
  }

  return proofParams
}

// TODO: read proof from local file rather than the zkwasm server (but need compitable to ho node)
export async function getVerifyProofParamsByFile(
  _proofFileName: string,
) {
  throw new Error('not implemented.')
}
