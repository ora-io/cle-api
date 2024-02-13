import { Block, ByteArray } from '@ora-io/cle-lib'
import { Bytes } from '@ora-io/cle-lib'

export function handleBlocks(blocksUnsafe: Block[], blocks: Block[]): Bytes {
  return blocksUnsafe[0].events[0].address.concat(ByteArray.fromI32(0)).concat(blocks[0].events[0].address) as Bytes
  // return blocksUnsafe[0].accountByHexString('0xa60ecf32309539dd84f27a9563754dca818b815e').storageByI32(8)
}
