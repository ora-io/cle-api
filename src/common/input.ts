import { trimPrefix } from './utils'

export class Input {
  inputStr = ['', '', '']
  auxParams = {}

  static PrivateId = 0
  static PublicId = 1
  static ContextId = 2

  getPrivateInputStr() {
    return this.inputStr[Input.PrivateId]
  }

  getPublicInputStr() {
    return this.inputStr[Input.PublicId]
  }

  getContextInputStr() {
    return this.inputStr[Input.ContextId]
  }

  formatIntInput(input: number) {
    return `0x${input.toString(16)}:i64 `
  }

  append(input: string, inputChanId = 0) {
    this.inputStr[+inputChanId] += input
  }

  formatHexStringInput(input: string) {
    return `0x${trimPrefix(input, '0x')}:bytes-packed `
  }

  formatVarLenInput(input: string) {
    const inp = trimPrefix(input, '0x')
    const formatted = `${this.formatIntInput(
            Math.ceil(inp.length / 2),
        )}${this.formatHexStringInput(inp)}`
    return formatted
  }

  // '+': convert boolean to number, for compatible
  addInt(input: number, inputChanId = 0) {
    this.inputStr[+inputChanId] += this.formatIntInput(input)
  }

  addHexString(input: string, inputChanId = 0) {
    this.inputStr[+inputChanId] += this.formatHexStringInput(input)
  }

  addVarLenHexString(input: string, inputChanId = 0) {
    this.inputStr[+inputChanId] += this.formatVarLenInput(input)
  }

  // ['0xaa', '0xbbbb', '0xcccccc']
  addVarLenHexStringArray(input: string, inputChanId = 0) {
    this.inputStr[+inputChanId] += this.formatIntInput(input.length)
    for (let i = 0; i < input.length; i++)
      this.inputStr[+inputChanId] += this.formatVarLenInput(input[i])
  }
}
