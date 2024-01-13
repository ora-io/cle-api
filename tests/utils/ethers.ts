import { ethers } from 'ethers'

export async function getLatestBlocknumber(rpcUrl: string) {
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const block = await provider.getBlock('latest')
  return block.number
}

