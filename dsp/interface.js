
// - prepare data from yaml
// - fill input 
// - prep structure

export class DataPrep {}

export class DataSourcePlugin {
  static async prepareData(zkgyaml, prepareParams){
    throw new Error("default: prepareData not implemented in DSP.")
  }
  static fillExecInput(input, zkgyaml, dataPrep){
    throw new Error("default: fillInput not implemented in DSP.")
  }
  static fillProveInput(input, zkgyaml, dataPrep){
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