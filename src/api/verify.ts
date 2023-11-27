import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import Web3EthContract from 'web3-eth-contract'
import {
  waitTaskStatus,
} from '../requests/zkwasm_taskdetails'
import { AggregatorVerifierABI } from '../common/constants'
import { ProveTaskNotReady } from '../common/error'

/**
 * Verify zk proof onchain.
 * @param {string} yamlContent
 * @param {string} proveTaskId
 * @param {string} ZkwasmProviderUrl
 * @param {boolean} enableLog
 * @returns {boolean} - true if verification success, false otherwise.
 */
export async function verify(
  proveTaskId: string,
  ZkwasmProviderUrl: string,
  verifierContractAddress: string,
  jsonRpcProviderUrl: string,
) {
  // Check task status of prove.
  const taskDetails = await waitTaskStatus(ZkwasmProviderUrl, proveTaskId, ['Done', 'Fail'], 3000, 0).catch((err) => {
    throw err
  })

  // TODO: timeout
  if (taskDetails.status !== 'Done')
    throw new ProveTaskNotReady('Prove task is not \'Done\', can\'t verify')

  // TODO: read proof from local file rather than the zkwasm server (but need compitable to ho node)

  // Inputs for verification
  const proof = ZkWasmUtil.bytesToBigIntArray(taskDetails.proof)
  const instances = ZkWasmUtil.bytesToBigIntArray(taskDetails.batch_instances)
  const aux = ZkWasmUtil.bytesToBigIntArray(taskDetails.aux)
  const arg = ZkWasmUtil.bytesToBigIntArray(taskDetails.instances)

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
