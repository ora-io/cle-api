import { Block } from '@ora-io/cle-lib'
import { Bytes } from '@ora-io/cle-lib'

export function handleBlocks(blocks: Block[]): Bytes {
  return Bytes.fromUTF8('Hello CLE!')
}
