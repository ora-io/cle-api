import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import type { providers } from 'ethers'
import { Contract } from 'ethers'
import { AggregatorVerifierABI, AggregatorVerifierAddress } from '../common/constants'
import { ProveTaskNotReady } from '../common/error'
import type { BatchOption, ProofParams, ProofParams as VerifyProofParams } from '../types'
import { BatchStyle } from '../types'
import { waitProve } from './prove'
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
): Promise<boolean> {
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
  // const arg = decode2DProofParam(verifyParams.instances)
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

  // verify success if no err throw
  let verificationResult = true
  await contract
    .verify(...verifyCallParam)
    .catch((err: any) => {
      if (err.message.startsWith('call revert exception;'))
      // if (err.message.startsWith('Returned error: execution reverted'))
        verificationResult = false
      else
        throw err
    })

  return verificationResult
}

export async function getVerifyProofParamsByTaskID(
  proverUrl: string,
  proveTaskId: string,
  options: BatchOption = {},
): Promise<ProofParams> {
  const result = await waitProve(proverUrl, proveTaskId, options)
  if (result.status !== 'Done' || !result.proofParams)
    throw new ProveTaskNotReady('Prove task is not \'Done\', can\'t verify')
  return result.proofParams
}
