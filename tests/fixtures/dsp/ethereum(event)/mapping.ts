import { Block } from '@ora-io/cle-lib'
import { Bytes } from '@ora-io/cle-lib'

export function handleBlocks(blocks: Block[]): Bytes {
  return blocks[0].events[0].address
}
