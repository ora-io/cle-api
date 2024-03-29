import { YamlHealthCheckFailed, YamlNotSupported } from '../common/error'
import { DataSource } from './interface'

// can't do this, because of lib handleFunc requires static type
// class CustomDataSection {
//   constructor(_witness, _public) {
//     this.witness = _witness;
//     this.public = _public;
//   }
//   static from_v_0_0_2(cds){
//     return new CustomDataSection(cds.witness, cds.public);
//   }
//   static healthCheck(cds){
//     if (!cds.witness) {
//       throw new YamlHealthCheckFailed('`offchain.custom.data` is missing `witness`');
//     }
//     if (cds.public) {
//       throw new YamlNotSupported('`offchain.custom.data.public` is not supported yet');
//     }
//   }
// }

export class OffchainDataSource extends DataSource {
  type: any
  constructor(yamlObj: any, kind: any, type: any) {
    super(yamlObj, kind)
    this.type = type
  }

  // signaficant to decide which lib dsp main it should use.
  getSignificantKeys(): string[] {
    return [this.kind, this.type]
  }

  static from_v_0_0_2(yamlOffDS: { kind: any; type: any }) {
    return new OffchainDataSource(
      yamlOffDS,
      yamlOffDS.kind,
      yamlOffDS.type,
      // CustomDataSection.from_v_0_0_2(yamlOffDS.data)
    )
  }

  static from_v_0_0_1(_yamlOffDS: any) {
    throw new Error('offchain dataSource is only supported in spec >= v0.0.2')
  }

  static healthCheck(yamlOffDS: { kind: string; type: string }) {
    if (yamlOffDS.kind !== 'offchain')
      throw new YamlHealthCheckFailed(`offchain dataSource is parsing wrong 'kind'. expect offchain, but got ${yamlOffDS.kind}.`)

    if (!yamlOffDS.type)
      throw new YamlHealthCheckFailed('offchain dataSource missing `type`')

    const validType = ['bytes']
    // const validType = ['bytes', 'arraybytes', 'multiarraybytes']

    if (!validType.includes(yamlOffDS.type))
      throw new YamlNotSupported(`Invalid offchain dataSource \`type\`, only support ${validType.toString()}`)

    // if (ds.type == 'bytes') {
    //   if (!ds.data) {
    //     throw new YamlHealthCheckFailed('offchain dataSource custom type missing `data`');
    //   }
    //   CustomDataSection.healthCheck(ds.data)
    // }
  }
}
