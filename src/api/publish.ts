import { ZkWasmUtil } from '@hyperoracle/zkwasm-service-helper'
import type { providers } from 'ethers'
import { Contract, ethers, utils } from 'ethers'
import {
  AddressZero,
  abiFactory,
  addressFactory,
} from '../common/constants'
import { DSPNotFound, GraphAlreadyExist } from '../common/error'
import { loadConfigByNetwork } from '../common/utils'
import { dspHub } from '../dsp/hub'
import { zkwasm_imagedetails } from '../requests/zkwasm_imagedetails'
import type { CLEExecutable } from '../types/api'
import type { CLEYaml } from '../types/zkgyaml'

/**
 * Publish and register CLE onchain.
 * @param {object} cleExecutable {wasmUint8Array, cleYaml}
 * @param {string} zkwasmProviderUrl - the zkWasm prover rpc url
 * @param {providers.JsonRpcProvider} provider - the provider of the target network
 * @param {string} ipfsHash - the ipfs hash of the CLE
 * @param {number} bountyRewardPerTrigger - the bounty reward per trigger in ETH
 * @param {object} signer - the acct for sign tx
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function publish(
  cleExecutable: CLEExecutable,
  zkwasmProviderUrl: string,
  provider: providers.JsonRpcProvider,
  ipfsHash: string,
  bountyRewardPerTrigger: number,
  signer: ethers.Wallet | ethers.providers.Provider | string,
) {
  const imgCmt = await getImageCommitment(cleExecutable, zkwasmProviderUrl)
  return publishByImgCmt(cleExecutable, imgCmt, provider, ipfsHash, bountyRewardPerTrigger, signer)
}

/**
 * Publish and register CLE onchain, with code hash provided.
 * @param {object} cleExecutable {cleYaml}
 * @param {providers.JsonRpcProvider} provider - the provider of the target network
 * @param {string} ipfsHash - the ipfs hash of the CLE
 * @param {number} bountyRewardPerTrigger - the bounty reward per trigger in ETH
 * @param {object} signer - the acct for sign tx
 * @param {boolean} enableLog - enable logging or not
 * @returns {string} - transaction hash of the publish transaction if success, empty string otherwise
 */
export async function publishByImgCmt(
  cleExecutable: CLEExecutable,
  imageCommitment: { pointX: ethers.BigNumber; pointY: ethers.BigNumber },
  provider: providers.JsonRpcProvider,
  ipfsHash: string,
  bountyRewardPerTrigger: number,
  signer: ethers.Wallet | ethers.providers.Provider | string,
) {
  const { cleYaml } = cleExecutable

  const dsp = dspHub.getDSPByYaml(cleYaml, { isLocal: false })
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  const dspID = utils.keccak256(utils.toUtf8Bytes(dsp.getLibDSPName()))

  const networkName = cleYaml?.dataDestinations[0].network
  const destinationContractAddress = cleYaml?.dataDestinations[0].address
  const factoryAddress = loadConfigByNetwork(cleYaml as CLEYaml, addressFactory, false)
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
    .catch((_err: any) => {
      throw new GraphAlreadyExist('Duplicate CLE detected. Only publishing distinct CLEs is allowed.')
    })

  const txReceipt = await tx.wait(1).catch((err: any) => {
    throw err
  })

  return {
    networkName,
    ...txReceipt,
  } as {
    networkName: string
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
 * @param cleExecutable
 * @param {string} zkwasmProviderUrl - the zkWasm prover rpc url
 * @returns
 */
export async function getImageCommitment(
  cleExecutable: CLEExecutable,
  zkwasmProviderUrl: string,
) {
  const { wasmUint8Array } = cleExecutable
  const md5 = ZkWasmUtil.convertToMd5(wasmUint8Array).toLowerCase()
  const deatails = await zkwasm_imagedetails(zkwasmProviderUrl, md5)
  const result = deatails[0]?.data.result[0]
  if (result === null)
    throw new Error('Can\'t find zkWasm image details, please finish setup before publish.')

  const pointX = littleEndianToUint256(result.checksum.x)
  const pointY = littleEndianToUint256(result.checksum.y)
  return { pointX, pointY }
}
