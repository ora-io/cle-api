import { Wallet, ethers, providers } from 'ethers'
import { formatEther } from 'ethers/lib/utils.js'

import { RLP } from '@ethereumjs/rlp'

import { isNumber } from './utils.js'

async function getRawLogsFromBlockReceipts(ethersProvider: providers.JsonRpcProvider, blockNumber: string, ignoreFailedTx: boolean) {
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

async function getRawLogsFromTxsReceipt(ethersProvider: providers.JsonRpcProvider, blockNumber: string, ignoreFailedTx: boolean) {
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

async function getRawReceiptsWithoutDebugRPC(ethersProvider: providers.JsonRpcProvider, blockid: string, ignoreFailedTx = false) {
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

  let isErigon = true
  try {
    await ethersProvider.send('eth_protocolVersion', [])
  }
  catch (error) {
    isErigon = false
  }

  if (isErigon) {
    return await getRawLogsFromBlockReceipts(ethersProvider, blockid, ignoreFailedTx)
  }
  else {
    console.warn('The RPC does not support erigon rpc, fetching data may be slow')
    return await getRawLogsFromTxsReceipt(ethersProvider, blockid, ignoreFailedTx)
  }
}

async function getRawReceiptsWithDebugRPC(ethersProvider: providers.JsonRpcProvider, blockid: string) {
  // Parse block id
  // if (typeof blockid === "string"){
  //     blockid = blockid.length >= 64 ? blockid : parseInt(blockid)
  // }

  if (Number.isFinite(blockid))
    blockid = ethers.utils.hexValue(blockid)
    // blockid = "0x" + blockid.toString(16);

  return ethersProvider.send('debug_getRawReceipts', [blockid])
}

export async function getRawReceipts(ethersProvider: providers.JsonRpcProvider, blockid: string, useDebugRPC = false) {
  if (useDebugRPC)
    return await getRawReceiptsWithDebugRPC(ethersProvider, blockid)

  else
    return await getRawReceiptsWithoutDebugRPC(ethersProvider, blockid, false)
}

export async function getBlockByNumber(ethersProvider: providers.JsonRpcProvider, blockNumber: string) {
  const fullBlock = await ethersProvider.send('eth_getBlockByNumber', [
    ethers.utils.hexValue(blockNumber),
    false,
  ])
  return fullBlock
}

export async function getBlockByHash(ethersProvider: providers.JsonRpcProvider, blockHash: string) {
  const fullBlock = await ethersProvider.send('eth_getBlockByHash', [
    blockHash,
    false,
  ])
  return fullBlock
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
  else if (isNumber(blockid)) {
    return await getBlockByNumber(ethersProvider, blockid).catch((error) => {
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
  const balance = formatEther(await provider.getBalance(wallet.address))
  return balance
}

export async function getProof(ethersProvider: providers.JsonRpcProvider, address: string, keys: any[], blockid: string) {
  return await ethersProvider.send('eth_getProof', [address, keys, blockid])
}
