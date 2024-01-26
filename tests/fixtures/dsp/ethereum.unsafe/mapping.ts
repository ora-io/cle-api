import { Block } from '@hyperoracle/cle-lib-test'
import { Bytes } from '@hyperoracle/cle-lib-test'

export function handleBlocks(blocksUnsafe: Block[]): Bytes {
  return blocksUnsafe[0].events[0].address
}
