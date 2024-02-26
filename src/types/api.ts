// TODO rename to api/interface.ts
import type { CLEYaml } from './zkgyaml'

export interface CLEExecutable {
  wasmUint8Array: Uint8Array
  cleYaml: CLEYaml
}

export interface ProofParams {
  aggregate_proof: Uint8Array
  batch_instances: Uint8Array
  aux: Uint8Array
  instances: Uint8Array[]
  extra?: Uint8Array
}

export interface RequestSetupResult {
  md5: string
  taskId: string
  taskDetails?: any // optional
}

export interface SetupResult {
  status: string
  success: boolean
  taskDetails?: any // optional
}

export interface RequestProveResult {
  md5: string
  taskId: string
  taskDetails?: any // optional
}

export interface ProveResult {
  status: string
  proofParams?: ProofParams
  taskDetails?: any // optional
}

/**
 * @param {string} proverUrl - the prover url
 * @param {string} ipfsHash - the ipfs hash from the 'upload' step
 * @param {number} bountyRewardPerTrigger - the bounty reward per trigger in ETH
 */
export interface PublishOptions {
  proverUrl?: string
  ipfsHash: string
  bountyRewardPerTrigger: number
}

export interface PublishResult {
  graphAddress?: string // deprecating. == cleAddress
  cleAddress: string
  blockNumber: number
  transactionHash: string
}
