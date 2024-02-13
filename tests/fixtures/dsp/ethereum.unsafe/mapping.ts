import { Block } from '@ora-io/cle-lib'
import { Bytes } from '@ora-io/cle-lib'

export function handleBlocks(blocksUnsafe: Block[]): Bytes {
  return blocksUnsafe[0].events[0].address
}
