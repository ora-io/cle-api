/* eslint-disable no-console */
import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import { Contract, ethers, utils } from 'ethers'
import type { providers } from 'ethers'
import {
  AddressZero,
  abiFactory,
  addressFactory,
} from '../common/constants'
import { logLoadingAnimation } from '../common/log_utils'
import type { ZkGraphExecutable } from '../types/api'
import { zkwasm_imagedetails } from '../requests/zkwasm_imagedetails'
import { dspHub } from '../dsp/hub'
import { loadConfigByNetwork } from '../common/utils'
import type { ZkGraphYaml } from '../types/zkgyaml'
import { GraphAlreadyExist } from '../common/error'

/**
 * Publish and register zkGraph onchain.
 * @param {object} zkGraphExecutable {wasmUint8Array, zkgraphYaml}
 * @param {string} zkwasmProviderUrl - the zkWasm prover rpc url
 * @param {providers.JsonRpcProvider} provider - the provider of the target network
 * @param {string} ipfsHash - the ipfs hash of the zkGraph
 * @param {number} bountyRewardPerTrigger - the bounty reward per trigger in ETH
 * @param {object} signer - the acct for sign tx
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function publish(
  zkGraphExecutable: ZkGraphExecutable,
  zkwasmProviderUrl: string,
  provider: providers.JsonRpcProvider,
  ipfsHash: string,
  bountyRewardPerTrigger: number,
  signer: ethers.Wallet | ethers.providers.Provider | string,
  enableLog = true,
) {
  const imgCmt = await getImageCommitment(zkGraphExecutable, zkwasmProviderUrl)
  return publishByImgCmt(zkGraphExecutable, imgCmt, provider, ipfsHash, bountyRewardPerTrigger, signer, enableLog)
}

/**
 * Publish and register zkGraph onchain, with code hash provided.
 * @param {object} zkGraphExecutable {zkgraphYaml}
 * @param {providers.JsonRpcProvider} provider - the provider of the target network
 * @param {string} ipfsHash - the ipfs hash of the zkGraph
 * @param {number} bountyRewardPerTrigger - the bounty reward per trigger in ETH
 * @param {object} signer - the acct for sign tx
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function publishByImgCmt(
  zkGraphExecutable: ZkGraphExecutable,
  imageCommitment: { pointX: ethers.BigNumber; pointY: ethers.BigNumber },
  provider: providers.JsonRpcProvider,
  ipfsHash: string,
  bountyRewardPerTrigger: number,
  signer: ethers.Wallet | ethers.providers.Provider | string,
  enableLog = true,
) {
  const { zkgraphYaml } = zkGraphExecutable

  const dsp = dspHub.getDSPByYaml(zkgraphYaml, { isLocal: false })
  const dspID = utils.keccak256(utils.toUtf8Bytes(dsp.getLibDSPName()))

  const networkName = zkgraphYaml?.dataDestinations[0].network
  const destinationContractAddress = zkgraphYaml?.dataDestinations[0].address
  const factoryAddress = loadConfigByNetwork(zkgraphYaml as ZkGraphYaml, addressFactory, false)
  const factoryContract = new Contract(factoryAddress, abiFactory, provider).connect(signer)

  const tx = await factoryContract
    .registry(
      destinationContractAddress,
      AddressZero,
      bountyRewardPerTrigger,
      dspID,
      ipfsHash,
      imageCommitment.pointX,
      imageCommitment.pointY,
    )
    .catch((err: any) => {
      throw new GraphAlreadyExist(err.message)
    })

  let loading
  if (enableLog === true) {
    console.log('[*] Please wait for publish tx... (estimated: 30 sec)', '\n')
    loading = logLoadingAnimation()
  }

  const txReceipt = await tx.wait(1).catch((err: any) => {
    throw err
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

function littleEndianToUint256(inputArray: number[]): ethers.BigNumber {
  const reversedArray = inputArray.reverse()
  const hexString = `0x${reversedArray.map(byte => byte.toString(16).padStart(2, '0')).join('')}`

  return ethers.BigNumber.from(hexString)
}

/**
 *
 * @param {object} zkGraphExecutable {wasmUint8Array}
 * @param zkGraphExecutable
 * @param {string} zkwasmProviderUrl - the zkWasm prover rpc url
 * @returns
 */
export async function getImageCommitment(
  zkGraphExecutable: ZkGraphExecutable,
  zkwasmProviderUrl: string,
) {
  const { wasmUint8Array } = zkGraphExecutable
  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toLowerCase()
  const deatails = await zkwasm_imagedetails(zkwasmProviderUrl, md5)
  const result = deatails[0]?.data.result[0]
  if (result === null)
    throw new Error('Can\'t find zkWasm image details, please finish setup before publish.')

  const pointX = littleEndianToUint256(result.checksum.x)
  const pointY = littleEndianToUint256(result.checksum.y)
  return { pointX, pointY }
}
