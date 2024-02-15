import { Input } from '../../common'
import type { CLEYaml } from '../../types'
import type { BlockPrep, EthereumDataPrep } from './blockprep'
import { MptInputPrep } from './mpt_data_prep'

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
  let mptIpt = new MptInputPrep(_dataPrep.blocknumberOrder.length)

  for(var blockNum of _dataPrep.blocknumberOrder) {
    // console.log("block number:", blockNum)
    let blcokPrepData = _dataPrep.blockPrepMap.get(blockNum)
    mptIpt.addBlock(blcokPrepData)
    // console.log("ctx:", mptIpt.getCtx())
    // console.log("private input:", mptIpt.getPriIpt())
  }
  input.addFormattedHexString(mptIpt.getCtx(), 2)
  input.addFormattedHexString(mptIpt.getPriIpt(), 0)
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
