import { Trie } from '@ethereumjs/trie'
import { MapDB } from '@ethereumjs/util'
import { RLP } from '@ethereumjs/rlp'
import { utils } from 'ethers'
import { fromHexString, safeHex, uint8ArrayToHex } from '../../common/utils'

// TODO: move this to rek
export class MPTTrie {
  trie: Trie
  keys: string[]
  values: string[]
  proof = new Map<number, string[]>() // cache, only fill with prove()
  constructor() {
    this.keys = []
    this.values = []
  }

  /**
   *
   * @param leafValues adapt to receipt trie, can pass in receiptRlp as leafValue
   * @returns this
   */
  async build(leafValues: string[]) {
    const leafCount = leafValues.length
    if (leafCount === 0)
      throw new Error('empty leaf value list, can\'t create mpt trie')
    this.trie = await Trie.create({ db: new MapDB() })
    this.keys = []
    this.values = []
    for (let leafIdx = 0; leafIdx < leafCount; leafIdx++) {
      const key = uint8ArrayToHex(RLP.encode(leafIdx))
      const rlp = safeHex(leafValues[leafIdx])
      this.keys.push(key)
      this.values.push(rlp)

      // console.log('key: ', key)
      // console.log('rlp: ', rlp)
      await this.trie.put(fromHexString(key), fromHexString(rlp))
    }
    return this
  }

  root(): Uint8Array {
    return this.trie.root()
  }

  async prove(idx: number, cache = false): Promise<string[]> {
    const prf = await this._prove(this.keys[idx])
    if (cache)
      this.proof.set(idx, prf)
    return prf
    // return this._proof(this.keys[idx]);
  }

  async _prove(key: string): Promise<string[]> {
  // _proof(key: string): string[] {
    const { stack } = await this.trie.findPath(fromHexString(key))
    const proof_paths = []
    for (let i = 0; i < stack.length; i++)
      proof_paths.push(uint8ArrayToHex(stack[i].serialize()))

    // console.log('proof paths: ', proof_paths)
    return proof_paths
  }

  lastNodeRlp(proof: string[]) {
    const last = proof.pop()
    if (!last)
      throw new Error('can\'t find last node.')
    return last
  }

  lastNodeRlpHash(proof: string[]) {
    return utils.keccak256(fromHexString(this.lastNodeRlp(proof)))
  }
}
