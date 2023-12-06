import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import Web3EthContract from 'web3-eth-contract'
import type { NullableObject } from '@murongg/utils'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { AggregatorVerifierABI, AggregatorVerifierAddress } from '../common/constants'
import { ProveTaskNotReady } from '../common/error'
import { loadConfigByNetwork } from '../common/utils'
import type { ZkGraphYaml } from '../types/zkgyaml'
import type { ZkGraphExecutable } from '../types/api'
// import { VerifyProofParams } from '@hyperoracle/zkwasm-service-helper'
export interface VerifyProofParams {
  aggregate_proof: Uint8Array
  batch_instances: Uint8Array
  aux: Uint8Array
  instances: Uint8Array
}

export async function verify(
  zkGraphExecutable: NullableObject<ZkGraphExecutable>,
  proofParams: VerifyProofParams,
  jsonRpcProviderUrl: string,
) {
  const { zkgraphYaml } = zkGraphExecutable
  const verifierContractAddress = loadConfigByNetwork(zkgraphYaml as ZkGraphYaml, AggregatorVerifierAddress, false)
  return await verifyProof(verifierContractAddress, proofParams, jsonRpcProviderUrl)
}

/**
 * Verify zk proof with eth call.
 * @param proofParams
 * @param verifierContractAddress
 * @param jsonRpcProviderUrl
 * @returns
 */
export async function verifyProof(
  verifierContractAddress: string,
  proofParams: VerifyProofParams,
  jsonRpcProviderUrl: string,
) {
  const proof = ZkWasmUtil.bytesToBigIntArray(proofParams.aggregate_proof)
  const instances = ZkWasmUtil.bytesToBigIntArray(proofParams.batch_instances)
  const aux = ZkWasmUtil.bytesToBigIntArray(proofParams.aux)
  const arg = ZkWasmUtil.bytesToBigIntArray(proofParams.instances)

  Web3EthContract.setProvider(jsonRpcProviderUrl)

  const contract = new Web3EthContract(AggregatorVerifierABI.abi as any, verifierContractAddress)

  let verificationResult = true
  // verify success if no err throw
  await contract.methods
    .verify(proof, instances, aux, [arg])
    .call()
    .catch((err: any) => {
      if (err.message.startsWith('Returned error: execution reverted'))
        verificationResult = false

      else
        throw err
    })

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
