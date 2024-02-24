import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import { Contract, ethers, utils } from 'ethers'
import {
  AddressZero,
  DEFAULT_URL,
  abiFactory,
  addressFactory,
} from '../common/constants'
import { DSPNotFound, GraphAlreadyExist } from '../common/error'
import { dspHub } from '../dsp/hub'
import { zkwasm_imagedetails } from '../requests/zkwasm_imagedetails'
import type { CLEExecutable } from '../types/api'

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

/**
 * Publish and register CLE onchain.
 * @param {object} cleExecutable {wasmUint8Array, cleYaml}
 * @param {ethers.Signer} signer - the acct for sign tx
 * @param options
 * @returns
 */
export async function publish(
  cleExecutable: CLEExecutable,
  signer: ethers.Signer,
  options: PublishOptions,
) {
  const { proverUrl = DEFAULT_URL.PROVER } = options
  const imgCmt = await getImageCommitment(cleExecutable, proverUrl)
  return publishByImgCmt(cleExecutable, signer, options, imgCmt)
}

/**
 * Publish and register CLE onchain, with code hash provided.
 * @param {object} cleExecutable {cleYaml}
 * @param {object} signer - the acct for sign tx
 * @param options
 * @param imageCommitment
 */
export async function publishByImgCmt(
  cleExecutable: CLEExecutable,
  signer: ethers.Signer,
  options: PublishOptions,
  imageCommitment: { pointX: ethers.BigNumber; pointY: ethers.BigNumber },
) {
  const { ipfsHash, bountyRewardPerTrigger = 0.05 } = options
  const { cleYaml } = cleExecutable

  const dsp = dspHub.getDSPByYaml(cleYaml)
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  const dspID = utils.keccak256(utils.toUtf8Bytes(dsp.getLibDSPName()))

  const destinationContractAddress
    = (cleYaml?.dataDestinations && cleYaml?.dataDestinations.length)
      ? cleYaml?.dataDestinations[0].address
      : AddressZero
  const networkName = (await signer.provider?.getNetwork())?.name
  const factoryAddress = networkName ? (addressFactory as any)[networkName] : AddressZero
  const factoryContract = new Contract(factoryAddress, abiFactory, signer)
  const bountyReward = ethers.utils.parseEther(bountyRewardPerTrigger.toString())

  const tx = await factoryContract
    .registry(
      destinationContractAddress,
      AddressZero,
      bountyReward,
      dspID,
      ipfsHash,
      imageCommitment.pointX,
      imageCommitment.pointY,
    )
    .catch((_err: any) => {
      throw new GraphAlreadyExist('Duplicate CLE detected. Only publishing distinct CLEs is allowed.')
    })

  const txReceipt = await tx.wait(1).catch((err: any) => {
    throw err
  })

  // in the transaction receipt, get the event data with topic 0x3573344393f569107cbc8438d3f0a47ca210029fdc8226cc33804a7b35cd32d8
  // this is the event newZkG(address graph)
  const logs = txReceipt.logs.filter((log: { topics: string[] }) =>
    log.topics.includes('0x3573344393f569107cbc8438d3f0a47ca210029fdc8226cc33804a7b35cd32d8'),
  )

  // Extract the graph address from the event
  const graphAddress = `0x${logs[0].data.slice(-40)}`

  return {
    graphAddress,
    ...txReceipt,
  } as {
    graphAddress: string
    blockNumber: number
    transactionHash: string
  }
}

function littleEndianToUint256(inputArray: number[]): ethers.BigNumber {
  const reversedArray = inputArray.reverse()
  const hexString = `0x${reversedArray.map(byte => byte.toString(16).padStart(2, '0')).join('')}`

  return ethers.BigNumber.from(hexString)
}

/**
 *
 * @param {object} cleExecutable {wasmUint8Array}
 * @param {string} proverUrl - the prover rpc url
 * @returns
 */
export async function getImageCommitment(
  cleExecutable: CLEExecutable,
  proverUrl: string,
) {
  const { wasmUint8Array } = cleExecutable
  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toLowerCase()
  const details = await zkwasm_imagedetails(proverUrl, md5)
  const result = details[0]?.data.result[0]
  if (result === null)
    throw new Error('Can\'t find zkWasm image details, please finish setup before publish.')

  const pointX = littleEndianToUint256(result.checksum.x)
  const pointY = littleEndianToUint256(result.checksum.y)
  return { pointX, pointY }
}
