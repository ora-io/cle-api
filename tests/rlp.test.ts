import { describe, expect, it } from 'vitest'
import { ethers } from 'ethers'
import { getBlock } from '../src/common/ethers_helper'
import { BlockPrep } from '../src/dsp/ethereum/blockprep'
import { config } from './config'

(global as any).__BROWSER__ = false

describe('test rlp', async () => {
  it('blockheader rlp', async () => {
    const rpcUrl = config.JsonRpcProviderUrl.sepolia
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)

    const rawblock = await getBlock(provider, 5016668)

    const rlp = (new BlockPrep(rawblock)).rlpheader
    expect(rlp).equal('f90241a0025974921a97becf37f7fdc29e0811a049892424aa28e05b439c8aff2b8d9c3ca01dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347941e2cd78882b12d3954a049fd82ffd691565dc0a5a0dcce553b95933feeb544064ac6d625d14f2cade14af0417bf7385aa26e28d29ca0c7f658355f6a8b6e3b22a1ff80d8609ff947bf62bb09883fcb2248c7655b4f12a0e40b0d566247b29459e36ad0b3555eb55582ef9fa914cb6681017502b26f6f9db9010000089500ec08400002581681021040c482130013020410400510208020820024d00c20421403489c08098218170a7c408880c0822630100082082820602a8470c108128000a100040800c70888c800a0020400028a4212006402002210002402280c021852820080804693a420108d0000210f8040110030000412121a042e040ea018120065102028e04880c1c0488d10000800026481530c041a0004411e050a3904150874005246081c4608500d001020a004642880200089018a0c02040040440123010051020904a4a422806040020104810169004140008b005084a052939100982900005000406200a2242824c9008054008a0010a24809808280151880834c8c5c8401c9c3808401068b17846595fa949f496c6c756d696e61746520446d6f63726174697a6520447374726962757465a01d632c68a5c589f1b4878bd582684b2f9dbb280a6cc275ab65ed80a39c9673ad880000000000000000840ac2e756a0b5c002c11d1eb3deb01d03ec77444bca11267b889b48af4cb378443841cd1225')

    // console.log(rlp)
  })
})
