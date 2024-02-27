import yaml from 'js-yaml'

export type DataSourceKind = 'ethereum' | 'offchain'
export type DataDestinationKind = 'ethereum' | 'offchain'

export class WrappedYaml {
  yamlObj: any
  constructor(yamlObj: any) {
    this.yamlObj = yamlObj
  }

  toString() {
    return yaml.dump(this.yamlObj)
  }

  filterByKeys(keysToInclude: string[]) {
    const filteredObject: any = {}
    Object.keys(this.yamlObj).forEach((key) => {
      if (keysToInclude.includes(key))
        filteredObject[key] = this.yamlObj[key]
    })
    return filteredObject
  }
}

export class DataSource extends WrappedYaml {
  kind: DataSourceKind
  constructor(yamlObj: any, kind: DataSourceKind) {
    super(yamlObj)
    this.kind = kind
  }

  getSignificantKeys(): string[] {
    throw new Error(`default: getSignificantKeys not implemented for DataSource kind ${this.kind}.`)
  }

  healthCheck() {
    throw new Error(`default: healthCheck not implemented for DataSource kind ${this.kind}.`)
  }
}

export class DataDestination extends WrappedYaml {
  kind: DataDestinationKind
  constructor(yamlObj: any, kind: DataDestinationKind) {
    super(yamlObj)
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
