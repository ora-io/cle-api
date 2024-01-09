/* eslint-disable no-console */
import BN from 'bn.js'
import type { CLEYaml } from '../types/zkgyaml'
import { networks } from './constants'

/**
 * Convert hex string to Uint8Array
 * @param hexString
 * @returns
 */
export function fromHexString(hexString: string) {
  hexString = hexString.startsWith('0x') ? hexString.slice(2) : hexString
  hexString = hexString.length % 2 ? `0${hexString}` : hexString
  return Uint8Array.from(Buffer.from(hexString, 'hex'))
}

/**
 * Convert Uint8Array to hex string
 * @param bytes
 * @returns
 */
export function toHexString(bytes: string | Uint8Array) {
  return Buffer.from(bytes).toString('hex')
}

/**
 * Reverse Uint8Array to string
 * @param arr
 * @returns
 */
export function toHexStringBytes32Reverse(arr: Uint8Array) {
  let result = ''
  for (let i = 0; i < arr.length / 32; i++) {
    result
      += `0x${toHexString(arr.slice(i * 32, (i + 1) * 32).reverse())}\n`
  }
  return result
}

export function areEqualArrays(first: Uint8Array, second: Uint8Array) {
  return (
    first.length === second.length
    && first.every((value, index) => value === second[index])
  )
}

/**
 * Trim prefix from string
 * @param str
 * @param prefix
 * @returns
 */
export function trimPrefix(str: string, prefix: string) {
  if (str.startsWith(prefix))
    str = str.substring(prefix.length)

  return str
}

/**
 * Concat hex strings
 * @param hexStrings
 * @returns
 */
export function concatHexStrings(hexStrings: string[]) {
  let result = ''
  for (const hexString of hexStrings)
    result += hexString.startsWith('0x') ? hexString.slice(2) : hexString

  return `0x${result}`
}

/**
 * Convert hex string to BN array
 * @param hexString
 * @returns
 */
function hexToBNs(hexString: string) {
  const bytes = new Array(Math.ceil(hexString.length / 16))
  for (let i = 0; i < hexString.length; i += 16)
    bytes[i] = new BN(hexString.slice(i, Math.min(i + 16, hexString.length)), 16, 'le')

  return bytes
}

/**
 * Parse input string
 * @param input
 * @returns
 */
function parseArg(input: string) {
  const inputArray = input.split(':')
  const value = inputArray[0]
  const type = inputArray[1]
  const re1 = /^[0-9A-Fa-f]+$/ // hexdecimal
  const re2 = /^\d+$/ // decimal

  // Check if value is a number
  if (!(re1.test(value.slice(2)) || re2.test(value))) {
    console.log('Error: input value is not an interger number')
    return null
  }

  // Convert value byte array
  if (type === 'i64') {
    let v
    if (value.slice(0, 2) === '0x')
      v = new BN(value.slice(2), 16)

    else
      v = new BN(value)

    return [v]
  }
  else if (type === 'bytes' || type === 'bytes-packed') {
    if (value.slice(0, 2) !== '0x') {
      console.log('Error: bytes input need start with 0x')
      return null
    }
    const bytes = hexToBNs(value.slice(2))
    return bytes
  }
  else {
    console.log('Unsupported input data type: %s', type)
    return null
  }
}

/**
 * Parse input arguments
 * https://github.com/zkcrossteam/g1024/blob/916c489fefa65ce8d4ee1a387f2bd4a3dcca8337/src/data/image.ts#L95
 * @param raw
 * @returns
 */
export function parseArgs(raw: string[]) {
  const parsedInputs = []
  for (let input of raw) {
    input = input.trim()
    if (input !== '') {
      const args = parseArg(input)
      if (args != null)
        parsedInputs.push(args)

      else
        throw new Error(`invalid args in ${input}`)
    }
  }
  return parsedInputs.flat()
}

/**
 * Get target network
 * @param inputtedNetworkName
 * @returns
 */
export function getTargetNetwork(inputtedNetworkName: string) {
  const validNetworkNames = networks.map(net => net.name.toLowerCase())
  if (!validNetworkNames.includes(inputtedNetworkName.toLowerCase())) {
    // console.log(`[-] NETWORK NAME "${inputtedNetworkName}" IS INVALID.`, "\n");
    // console.log(`[*] Valid networks: ${validNetworkNames.join(", ")}.`, "\n");
    // logDivider();
    // process.exit(1);
    return
  }
  const targetNetwork = networks.find(
    net => net.name.toLowerCase() === inputtedNetworkName.toLowerCase(),
  )
  return targetNetwork
}

/**
 * normalize DSP params
 * @param paramNames
 * @param paramKeyValue
 * @returns
 */
export function dspParamsNormalize(paramNames: string[] = [], paramKeyValue: Record<string, any> = {}) {
  const params = {}
  paramNames.forEach((param) => {
    Reflect.set(params, param, paramKeyValue[param])
  })
  return params
}

/**
 * Check if value is a number
 * @param value
 * @returns
 */
export function isNumber(value: any) {
  return (typeof value === 'number' && isFinite(value)) || !isNaN(Number(value))
}

interface NetworksConfig {
  mainnet?: any // Optional
  sepolia?: any // Optional
  goerli?: any // Optional
}

export function loadConfigByNetwork(yaml: Partial<CLEYaml>, networksConfig: NetworksConfig, isDataSource: boolean) {
  let network: string | undefined
  if (yaml.dataSources?.[0].kind !== 'ethereum')
    throw new Error('loadConfigByNetwork only support ethereum right now.')

  // For exec and prove, we need to load the data source network
  if (isDataSource)
    network = yaml.dataSources?.[0].network

  // For publish & verify, we need to load the data destination network
  else
    network = yaml.dataDestinations?.[0].network

  // TODO: move health check
  if (!network) {
    throw new Error(
      `Network of "${isDataSource ? 'dataSource' : 'dataDestination'}" is not defined in yaml.`,
    )
  }

  // Check if the network is defined in constants.
  // const targetNetwork = getTargetNetwork(network)?.name.toLowerCase()
  // let targetConfig = ''
  // if (targetNetwork) {
  const targetConfig = networksConfig ? (networksConfig as any)[network] : undefined
  // }

  if (!targetConfig) {
    throw new Error(
      `[-] networksConfig for network "${network}" is not found in zkgraph-api.`,
    )
  }

  return targetConfig
}

export function safeHex(rawHex: string) {
  let hex = ''
  if (rawHex.startsWith('0x'))
    hex = rawHex.slice(2)
  else
    hex = rawHex

  if (hex.length % 2 === 0)
    return hex
  else
    return `0${hex}`
}

export function uint8ArrayToHex(uint8array: Uint8Array): string {
  return Array.from(uint8array).map(b => b.toString(16).padStart(2, '0')).join('')
}
