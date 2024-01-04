import { Wallet, ethers, providers, utils } from 'ethers'

import { RLP } from '@ethereumjs/rlp'

import { isMaybeNumber, retry, toNumber } from '@murongg/utils'
import { BlockNotFound, OldBlockNumber } from './error'

async function getRawLogsFromBlockReceipts(ethersProvider: providers.JsonRpcProvider, blockNumber: string | number, ignoreFailedTx: boolean) {
  // const blockReceipts = await ethersProvider.send("eth_getBlockReceipts", ["0x" + (blockNumber).toString(16)]);
  const blockReceipts = await ethersProvider.send('eth_getBlockReceipts', [blockNumber])
  if (blockReceipts == null)
    throw new Error('[-] Can\'t get block receipts, please make sure blocknum is valid')

  const rawReceipt = []
  for (const receipt of blockReceipts) {
    if (ignoreFailedTx && receipt.status !== '0x1')
      continue

    const txRawLogs = []
    const txRawReceipt = [receipt.status, receipt.cumulativeGasUsed, receipt.logsBloom]

    const logs = receipt.logs
    for (const log of logs)
      txRawLogs.push([log.address, log.topics, log.data])

    txRawReceipt.push(txRawLogs) // empty log will be included
    rawReceipt.push(`0x${Buffer.from(RLP.encode(txRawReceipt)).toString('hex')}`)
  }

  return rawReceipt
}

async function getRawLogsFromTxsReceipt(ethersProvider: providers.JsonRpcProvider, blockNumber: string | number, ignoreFailedTx: boolean) {
  const block = await ethersProvider.getBlock(blockNumber)
  const rawReceipt = []
  for (const txHash of block.transactions) {
    const receipt = await ethersProvider.getTransactionReceipt(txHash)
    if (ignoreFailedTx && receipt.status !== 1)
      continue

    if (receipt.status === undefined)
      throw new Error('[-] Can\'t get tx status, please make sure provider is enabled Byzantium.')

    const txRawLogs = []
    const txRawReceipt = [`0x${receipt.status.toString(16)}`, `0x${receipt.cumulativeGasUsed.toNumber().toString(16)}`, receipt.logsBloom]

    const logs = receipt.logs
    for (const log of logs)
      txRawLogs.push([log.address, log.topics, log.data])

    txRawReceipt.push(txRawLogs as any) // empty log will be included
    rawReceipt.push(`0x${Buffer.from(RLP.encode(txRawReceipt)).toString('hex')}`)
  }

  return rawReceipt
}

async function getRawReceiptsWithoutDebugRPC(ethersProvider: providers.JsonRpcProvider, blockid: string | number, ignoreFailedTx = false) {
  // Parse block id
  // if (typeof blockid === "string"){
  //     blockid = blockid.length == 66 ? blockid : parseInt(blockid)
  // }
  // if (typeof blockid === "string" && blockid.length >= 64){
  //     throw Error("[-] please provide a valid block number.")
  // }

  if (Number.isFinite(blockid))
    blockid = ethers.utils.hexValue(blockid)
  // blockid = "0x" + blockid.toString(16);

  try {
    // using erigon rpc method first
    return await getRawLogsFromBlockReceipts(ethersProvider, blockid, ignoreFailedTx)
  }
  catch {
    console.warn('The RPC does not support erigon rpc, fetching data may be slow')
    return await getRawLogsFromTxsReceipt(ethersProvider, blockid, ignoreFailedTx)
  }
}

async function getRawReceiptsWithDebugRPC(ethersProvider: providers.JsonRpcProvider, blockid: number | string) {
  // Parse block id
  // if (typeof blockid === "string"){
  //     blockid = blockid.length >= 64 ? blockid : parseInt(blockid)
  // }

  if (Number.isFinite(blockid))
    blockid = ethers.utils.hexValue(blockid)
    // blockid = "0x" + blockid.toString(16);

  return ethersProvider.send('debug_getRawReceipts', [blockid])
}

export async function getRawReceipts(ethersProvider: providers.JsonRpcProvider, blockid: string | number, useDebugRPC = false) {
  if (useDebugRPC)
    return await getRawReceiptsWithDebugRPC(ethersProvider, blockid as string)

  else
    return await getRawReceiptsWithoutDebugRPC(ethersProvider, blockid as string, false)
}

export async function getBlockBasic(provider: providers.JsonRpcProvider, block: string | number, type: 'hash' | 'number') {
  const fn = async () => {
    const fullBlock = await provider.send(type === 'hash' ? 'eth_getBlockByHash' : 'eth_getBlockByNumber', [
      type === 'hash' ? block : ethers.utils.hexValue(block),
      false,
    ])
    return fullBlock
  }
  const result = await retry(fn, 3)
  if (result === null)
    throw new BlockNotFound(`Invalid blocknum ${block}, please check the given blocknum or the chain network specified in yaml.`)

  else
    return result
}

export async function getBlockWithTxs(ethersProvider: providers.JsonRpcProvider, blockNumber: number) {
  return await ethersProvider.getBlockWithTransactions(blockNumber)
}

export async function getBlockByNumber(ethersProvider: providers.JsonRpcProvider, blockNumber: number) {
  return await getBlockBasic(ethersProvider, blockNumber, 'number')
}

export async function getBlockByHash(ethersProvider: providers.JsonRpcProvider, blockHash: string) {
  return await getBlockBasic(ethersProvider, blockHash, 'hash')
}

export async function getBlock(ethersProvider: providers.JsonRpcProvider, blockid: string) {
  if (
    typeof blockid === 'string'
    && blockid.length === 66
    && blockid.charAt(0) === '0'
    && blockid.charAt(1) === 'x'
  ) {
    return await getBlockByHash(ethersProvider, blockid).catch((error) => {
      throw error
      // console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
      // process.exit(1);
    })
  }
  else if (isMaybeNumber(blockid)) {
    return await getBlockByNumber(ethersProvider, toNumber(blockid)).catch((error) => {
      throw error
      // console.err("[-] ERROR: Failed to getBlockByNumber()", "\n");
      // process.exit(1);
    })
  }
  else {
    throw new Error('please provide a valid block number.')
  }
}

export async function getBalance(privateKey: string, networkName: providers.Networkish) {
  const wallet = new Wallet(privateKey)
  // Using default provider to avoid errors in user defined provider
  const provider = providers.getDefaultProvider(networkName)
  const balance = utils.formatEther(await provider.getBalance(wallet.address))
  return balance
}

export async function getProof(ethersProvider: providers.JsonRpcProvider, address: string, keys: any[], blockid: string) {
  try {
    return await ethersProvider.send('eth_getProof', [address, keys, blockid])
  }
  catch (error: any) {
    if (error?.body?.includes('requested block is too old')) {
      const body = JSON.parse(error.body)
      throw new OldBlockNumber(body.error.message)
    }
    else {
      throw error
    }
  }
}

export function getRawTransaction(tx: providers.TransactionResponse): string {
  function addKey(accum: any, key: keyof providers.TransactionResponse) {
    if (tx[key] !== undefined && tx[key] !== null)
      accum[key] = tx[key]

    return accum
  }

  const txFields: (keyof providers.TransactionResponse)[] = ['accessList', 'chainId', 'data', 'gasPrice', 'gasLimit', 'maxFeePerGas', 'maxPriorityFeePerGas', 'nonce', 'to', 'type', 'value']
  const sigFields: (keyof providers.TransactionResponse)[] = ['v', 'r', 's']

  if (tx?.type === 2)
    delete tx.gasPrice

  const raw = utils.serializeTransaction(txFields.reduce(addKey, { }), sigFields.reduce(addKey, { }))

  if (utils.keccak256(raw) !== tx.hash)
    throw new Error('serializing failed!')

  return raw
}

export function buildCreate2Address(creatorAddress: string, saltHex: string, byteCode: string): string {
  return `0x${ethers.utils
    .keccak256(
      `0x${['ff', creatorAddress, saltHex, ethers.utils.keccak256(byteCode)]
        .map(x => x.replace(/0x/, ''))
        .join('')}`,
    )
    .slice(-40)}`.toLowerCase()
}

