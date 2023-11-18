import { YamlHealthCheckFailed, YamlNotSupported } from "../common/error.js";
import { DataSource } from "./zkgyaml_def.js";

class CustomDataSection {
  constructor(_witness, _public) {
    this.witness = _witness;
    this.public = _public;
  }
  static from_v_0_0_2(cds){
    return new CustomDataSection(cds.witness, cds.public);
  }
  static healthCheck(cds){
    if (!cds.witness) {
      throw new YamlHealthCheckFailed('`offchain.custom.data` is missing `witness`');
    }
    if (cds.public) {
      throw new YamlNotSupported('`offchain.custom.data.public` is not supported yet');
    }
  }
}

export class OffchainDataSource extends DataSource {
  constructor(kind, type, data) {
    super(kind);
    this.type = type;
    this.data = data;
  }

  static from_v_0_0_2(yamlOffDS){
    return new OffchainDataSource(
      yamlOffDS.kind,
      yamlOffDS.type,
      CustomDataSection.from_v_0_0_2(yamlOffDS.data)
    )
  }
  static from_v_0_0_1(yamlOffDS){
    throw new Error('offchain dataSource is only supported in spec >= v0.0.2');
  }

  static healthCheck(ds){
    if (!ds.type) {
      throw new YamlHealthCheckFailed('offchain dataSource missing `type`')
    }
    if (ds.type != 'custom') {
      throw new YamlNotSupported('offchain dataSource `type` only support "custom"')
    } 
    if (ds.type == 'custom') {
      if (!ds.data) {
        throw new YamlHealthCheckFailed('offchain dataSource custom type missing `data`');
      }
      CustomDataSection.healthCheck(ds.data)
    }
  }
}
