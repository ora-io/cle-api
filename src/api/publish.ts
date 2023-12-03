/* eslint-disable no-console */
import type { ethers, providers } from 'ethers'
import { Contract } from 'ethers'
import type { NullableObject } from '@murongg/utils'
import {
  AddressZero,
  AggregatorVerifierAddress,
  abiFactory,
  addressFactory,
} from '../common/constants'
import { logLoadingAnimation } from '../common/log_utils'
import type { ZkGraphExecutable } from '../types/api'
import { loadConfigByNetwork } from '../common/utils'
import type { ZkGraphYaml } from '../types/zkgyaml'

/**
 * Publish and register zkGraph onchain.
 * @param {object} zkGraphExecutable {'zkgraphYaml': zkgraphYaml}
 * @param {providers.JsonRpcProvider} provider - the provider of the target network
 * @param {string} ipfsHash - the ipfs hash of the zkGraph
 * @param {number} bountyRewardPerTrigger - the bounty reward per trigger in ETH
 * @param {object} signer - the acct for sign&submi prove task to zkwasm
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function publish(
  zkGraphExecutable: NullableObject<ZkGraphExecutable>,
  provider: providers.JsonRpcProvider,
  ipfsHash: string,
  bountyRewardPerTrigger: number,
  signer: ethers.Wallet | string,
  enableLog = true,
) {
  const { zkgraphYaml } = zkGraphExecutable

  const networkName = zkgraphYaml?.dataDestinations[0].network
  const destinationContractAddress = zkgraphYaml?.dataDestinations[0].address
  const factoryContract = new Contract(addressFactory, abiFactory, provider).connect(signer)

  // Get verification contract address.
  const verifierContractAddress = loadConfigByNetwork(zkgraphYaml as ZkGraphYaml, AggregatorVerifierAddress, false)

  const tx = await factoryContract
    .registry(
      AddressZero,
      bountyRewardPerTrigger,
      verifierContractAddress,
      destinationContractAddress,
      ipfsHash,
    )
    .catch((err: any) => {
      throw err
      // if (enableLog === true) console.log(`[-] ERROR WHEN CONSTRUCTING TX: ${err}`, "\n");
      // return "";
    })

  let loading
  if (enableLog === true) {
    console.log('[*] Please wait for publish tx... (estimated: 30 sec)', '\n')
    loading = logLoadingAnimation()
  }

  const txReceipt = await tx.wait(1).catch((err: any) => {
    throw err
    if (enableLog === true) {
      console.log(`[-] ERROR WHEN WAITING FOR TX: ${err}`, '\n')
      loading.stopAndClear()
    }
    return ''
  })

  if (enableLog === true) {
    loading?.stopAndClear()
    console.log('[+] ZKGRAPH PUBLISHED SUCCESSFULLY!', '\n')
    console.log(
      `[*] Transaction confirmed in block ${txReceipt.blockNumber} on ${networkName}`,
    )
    console.log(`[*] Transaction hash: ${txReceipt.transactionHash}`, '\n')
  }

  return txReceipt.transactionHash
}
