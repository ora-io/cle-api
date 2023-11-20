export class DataSource {
  constructor(kind) {
    this.kind = kind;
  }
  getSignificantKeys() {
    throw new Error(`default: getSignificantKeys not implemented for DataSource kind ${this.kind}.`)
  }
  healthCheck() {
    throw new Error(`default: healthCheck not implemented for DataSource kind ${this.kind}.`)
  }
}

export class DataDestination {
  constructor(kind) {
    this.kind = kind;
  }
  getSignificantKeys() {
    throw new Error(`default: getSignificantKeys not implemented for DataDestination kind ${this.kind}.`)
  }
  healthCheck() {
    throw new Error(`default: healthCheck not implemented for DataDestination kind ${this.kind}.`)
  }
}

export class Mapping {
  constructor(language, file, handler) {
    this.language = language;
    this.file = file;
    this.handler = handler;
  }
  static from_v_0_0_2(yamlMapping){
    return new Mapping(
      yamlMapping.language,
      yamlMapping.file,
      yamlMapping.handler
    )
  }
  static from_v_0_0_1(yamlMapping){
    return null // not important for 0.0.1
  }
}