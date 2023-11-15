
// - prepare data from yaml
// - fill input 
// - prep structure

export class DataPrep {}

export class DataSourcePlugin {
  static getLibFuncNames(){
    // SHOULD align with zkgraph-lib/dsp/ethereum/index.ts
    // return ['zkmain_name_in_lib', 'asmain_name_in_lib']
    throw new Error("default: getLibFuncNames not implemented in DSP.")
  }
  static async prepareData(zkgraphYaml, prepareParams){
    throw new Error("default: prepareData not implemented in DSP.")
  }
  static fillExecInput(input, zkgraphYaml, dataPrep){
    throw new Error("default: fillInput not implemented in DSP.")
  }
  static fillProveInput(input, zkgraphYaml, dataPrep){
    throw new Error("default: fillInput not implemented in DSP.")
  }
  static toPrepareParams() {
    throw new Error("default: toPrepareParams not implemented in DSP.")
    return {
      "default": null,
    }
  }
  static toExecParams(){
    throw new Error("default: toExecParams not implemented in DSP.")
  }

  static toProveParams(){
    throw new Error("default: toProveParams not implemented in DSP.")
  }

  static async toPrepareParamsFromExecParams(execParams){
    throw new Error("default: toPrepareParamsFromExecParams not implemented in DSP.")
  }

  static async toPrepareParamsFromProveParams(proveParams){
    throw new Error("default: toPrepareParamsFromProveParams not implemented in DSP.")
  }
}