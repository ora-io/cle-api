import { ZkWasmUtil } from '@ora-io/zkwasm-service-helper'
import { Contract, ethers, utils } from 'ethers'
import {
  AddressZero,
  DEFAULT_URL,
  EventSigNewCLE,
  abiFactory,
  addressFactory,
} from '../common/constants'
import { CLEAlreadyExist, DSPNotFound, TxFailed } from '../common/error'
import { dspHub } from '../dsp/hub'
import type { CLEExecutable, CLEYaml } from '../types'
import { requireImageDetails } from './setup'

export interface PublishOptions {
  proverUrl?: string
  ipfsHash: string // the ipfs hash from the 'upload' step
  bountyRewardPerTrigger: number // the bounty reward per verified trigger (ETH)
}

export interface PublishResult {
  graphAddress?: string // deprecating. == cleAddress
  cleAddress: string
  blockNumber: number
  transactionHash: string
  networkName: string
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
): Promise<PublishResult> {
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
): Promise<PublishResult> {
  const { ipfsHash, bountyRewardPerTrigger = 0.05 } = options
  const { cleYaml } = cleExecutable

  const dsp = dspHub.getDSPByYaml(cleYaml)
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  // for ora prover upgrade
  const suffix = (cy: CLEYaml) => {
    const allEthDS = cy.dataSources.filter(
      ds => ds.kind === 'ethereum')// ds.filterByKeys(['event', 'storage', 'transaction'])  //
    const allEthDSState = allEthDS.filter(
      ds => Object.keys(ds.filterByKeys(['storage'])).length !== 0)
    const allEthDSStateOnly = allEthDSState.filter(
      ds => Object.keys(ds.filterByKeys(['event', 'transaction'])).length === 0)
    if (allEthDSStateOnly.length > 0)
      return ':stateonly'

    const allNoTx = allEthDS.filter(
      ds => Object.keys(ds.filterByKeys(['transaction'])).length === 0)
    if (allNoTx.length > 0)
      return ':notx'

    return ''
  }
  // logger.debug('[*] dsp name suffix for clecontract:', suffix(cleYaml))

  const dspID = utils.keccak256(utils.toUtf8Bytes(dsp.getLibDSPName() + suffix(cleYaml)))

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
      throw new CLEAlreadyExist('Duplicate CLE detected. Only publishing distinct CLEs is allowed.')
    })

  const txReceipt = await tx.wait(1).catch((err: any) => {
    throw err
  })

  if (txReceipt.status !== 1)
    throw new TxFailed(`Transaction failed (${txReceipt.transactionHash})`)

  // filter event with topic "NewCLE(address)" in transaction receipt
  const logs = txReceipt.logs.filter((log: { address: string; topics: string[] }) =>
    log.address === factoryAddress
    && log.topics[0] === EventSigNewCLE,
  )

  if (logs.length === 0)
    throw new Error(`Can't identify NewCLE(address) event in tx receipt (${txReceipt.transactionHash}), please check the TX or factory contract (${factoryAddress})`)

  // Extract the cle address from the event
  const cleAddress = `0x${logs[0].data.slice(-40)}`

  return {
    cleAddress,
    graphAddress: cleAddress, // for backward compatible only, rm when deprecate
    ...txReceipt,
  } as PublishResult
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
  const details = await requireImageDetails(proverUrl, md5)
  const pointX = littleEndianToUint256(details.checksum.x)
  const pointY = littleEndianToUint256(details.checksum.y)
  return { pointX, pointY }
}
