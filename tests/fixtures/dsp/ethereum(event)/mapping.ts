import { Block } from '@hyperoracle/cle-lib-test'
import { Bytes } from '@hyperoracle/cle-lib-test'

export function handleBlocks(blocks: Block[]): Bytes {
  return blocks[0].events[0].address
}
