import { Input } from '../../common'
import type { CLEYaml } from '../../types'
import type { BlockPrep, EthereumDataPrep } from './blockprep'
import { MptInput } from './mpt_input'

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

function fillMPTInput(input: Input, _cleYaml: CLEYaml, dataPrep: EthereumDataPrep) {
  const mptIpt = new MptInput(dataPrep.blocknumberOrder.length)

  for (const blockNum of dataPrep.blocknumberOrder) {
    // console.log("block number:", blockNum)
    const blcokPrepData = dataPrep.blockPrepMap.get(blockNum)
    mptIpt.addBlock(blcokPrepData)
    // console.log("ctx:", mptIpt.getCtx())
    // console.log("private input:", mptIpt.getPriIpt())
  }
  input.append(mptIpt.getCtx(), 2)
  input.append(mptIpt.getPriIpt(), 0)
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
