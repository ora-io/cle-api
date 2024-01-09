import { Block } from '@hyperoracle/cle-lib'
import { Bytes } from '@hyperoracle/cle-lib'

export function handleBlocks(blocks: Block[]): Bytes {
  return Bytes.fromUTF8('Hello CLE!')
}
