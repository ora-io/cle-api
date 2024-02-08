import { Input } from '../../common'
import type { CLEYaml } from '../../types'
import type { BlockPrep, EthereumDataPrep } from './blockprep'

export function genAuxParams(
  cleYaml: CLEYaml,
  dataPrep: EthereumDataPrep,
) {
  let mptInput = new Input()
  mptInput = fillMPTInput(mptInput, cleYaml, dataPrep)

  const adaptorParams = genAdaptorParams(cleYaml, dataPrep)

  const auxParams = {
    mpt: {
      private_input: mptInput.getPrivateInputStr(),
      public_input: mptInput.getPublicInputStr(),
      context_input: mptInput.getContextInputStr(),
    },
    adaptor: {
      checkpoint_blocknum: adaptorParams.checkpoint_blocknum, // "0x1234"
      mpt_blocknums: adaptorParams.mpt_blocknums, // ["blocknum1", "blocknum2", ...]
      mpt_stateroots: adaptorParams.mpt_stateroots, // ["0xstateroot1", "0xstateroot2", ...]
      // placeholder
      // "mpt_receiptroots": adaptorParams.mpt_receiptroots,
      // "mpt_txroots": adaptorParams.mpt_txroots
    },
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
  }
  return adaptorParam
}

function calcCheckpointBlocknum(_blockNums: number[]) {
  return 1234
}
