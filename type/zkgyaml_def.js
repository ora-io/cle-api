export class DataSource {
  constructor(kind) {
    this.kind = kind;
  }
  healthCheck() {
    throw new Error("default: healthCheck not implemented for this DataSource kind.")
  }
}

export class DataDestination {
  constructor(kind) {
    this.kind = kind;
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