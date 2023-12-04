/* eslint-disable no-console */
import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import type { providers } from 'ethers'
import { Contract, ethers, utils } from 'ethers'
import {
  AddressZero,
  abiFactory,
  addressFactory,
} from '../common/constants'
import { logLoadingAnimation } from '../common/log_utils'
import type { ZkGraphExecutable } from '../types/api'
import { zkwasm_imagedetails } from '../requests/zkwasm_imagedetails'
import { dspHub } from '../dsp/hub'

/**
 * Publish and register zkGraph onchain.
 * @param {object} zkGraphExecutable {'zkgraphYaml': zkgraphYaml}
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
  signer: ethers.Wallet | string,
  enableLog = true,
) {
  const { wasmUint8Array, zkgraphYaml } = zkGraphExecutable
  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toLowerCase()
  const deatails = await zkwasm_imagedetails(zkwasmProviderUrl, md5)
  const result = deatails[0].data.result[0]
  if (result === null)
    return

  const pointX = littleEndianToUint256(result.checksum.x)
  const pointY = littleEndianToUint256(result.checksum.y)

  const dsp = dspHub.getDSPByYaml(zkgraphYaml, { isLocal: false })
  const dspID = utils.keccak256(utils.toUtf8Bytes(dsp.getLibDSPName()))
  console.log(dspID)
  const networkName = zkgraphYaml?.dataDestinations[0].network
  const destinationContractAddress = zkgraphYaml?.dataDestinations[0].address
  const factoryContract = new Contract(addressFactory, abiFactory, provider).connect(signer)

  const tx = await factoryContract
    .registry(
      destinationContractAddress,
      AddressZero,
      bountyRewardPerTrigger,
      dspID,
      ipfsHash,
      pointX,
      pointY,
    )
    .catch((err: any) => {
      throw err
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
