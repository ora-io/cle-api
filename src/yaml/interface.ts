export type DataSourceKind = 'ethereum' | 'offchain'
export type DataDestinationKind = 'ethereum' | 'offchain'

export class DataSource {
  kind: DataSourceKind
  constructor(kind: DataSourceKind) {
    this.kind = kind
  }

  getSignificantKeys(): string[] {
    throw new Error(`default: getSignificantKeys not implemented for DataSource kind ${this.kind}.`)
  }

  healthCheck() {
    throw new Error(`default: healthCheck not implemented for DataSource kind ${this.kind}.`)
  }
}

export class DataDestination {
  kind: DataDestinationKind
  constructor(kind: DataDestinationKind) {
    this.kind = kind
  }

  getSignificantKeys(): string[] {
    throw new Error(`default: getSignificantKeys not implemented for DataDestination kind ${this.kind}.`)
  }

  healthCheck() {
    throw new Error(`default: healthCheck not implemented for DataDestination kind ${this.kind}.`)
  }
}

export class Mapping {
  language: string
  file: string
  handler: string
  constructor(language: string, file: string, handler: string) {
    this.language = language
    this.file = file
    this.handler = handler
  }

  static from_v_0_0_2(yamlMapping: { language: string; file: string; handler: string }) {
    return new Mapping(
      yamlMapping.language,
      yamlMapping.file,
      yamlMapping.handler,
    )
  }

  static from_v_0_0_1(_yamlMapping: { language: string; file: string; handler: string }) {
    return null // not important for 0.0.1
  }
}
