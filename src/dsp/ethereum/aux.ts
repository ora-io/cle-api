import { Input } from '../../common'
import type { CLEYaml } from '../../types'
import type { BlockPrep, EthereumDataPrep } from './blockprep'

export function genAuxParams(
  cleYaml: CLEYaml,
  dataPrep: EthereumDataPrep,
) {
  let mptInput = new Input()
  mptInput = fillMPTInput(mptInput, cleYaml, dataPrep)

  const auxParams = {
    mpt: {
      private_input: mptInput.getPrivateInputStr(),
      public_input: mptInput.getPublicInputStr(),
      context_input: mptInput.getContextInputStr(),
    },
    adaptor: genAdaptorParams(cleYaml, dataPrep),
  }
  return auxParams
}

function fillMPTInput(input: any, _cleYaml: CLEYaml, _dataPrep: EthereumDataPrep) {
  return input
}

function genAdaptorParams(_cleYaml: CLEYaml, dataPrep: EthereumDataPrep) {
  const adaptorParam = {
    checkpoint_blocknum: calcCheckpointBlocknum([4321]), // "0x1234"
    mpt_blocknums: dataPrep.blocknumberOrder, // ["blocknum1", "blocknum2", ...]
    mpt_stateroots: dataPrep.blocknumberOrder.map((bn: any) => { return (dataPrep.blockPrepMap.get(bn) as BlockPrep).stateRoot }), // ["0xstateroot1", "0xstateroot2", ...]
    // placeholder
    // mpt_receiptroots: dataPrep.blocknumberOrder.map((bn: any) => { return (dataPrep.blockPrepMap.get(bn) as BlockPrep).receiptroots }),
    // mpt_txroots: dataPrep.blocknumberOrder.map((bn: any) => { return (dataPrep.blockPrepMap.get(bn) as BlockPrep).txroots }),
    rlp_blockheader: dataPrep.blocknumberOrder.map(
      (bn: any) => { return isRecentBlock(bn, dataPrep.latestBlocknumber) ? (dataPrep.blockPrepMap.get(bn) as BlockPrep).rlpheader : null }), // ['0xrecentblockheaderrlp', '' for bho blocknum]
  }
  return adaptorParam
}

function isRecentBlock(blocknum: number, latestBlocknumber: number) {
  return blocknum > latestBlocknumber - 200 // TODO: fine-tune this.
}

function calcCheckpointBlocknum(_blockNums: number[]) {
  return null
}
