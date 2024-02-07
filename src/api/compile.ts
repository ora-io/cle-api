import { hasOwnProperty, randomStr } from '@murongg/utils'
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import type { CLEExecutable } from '../types/api'
import { dspHub } from '../dsp/hub'
import { DSPNotFound, MissingRequiredOptions } from '../common/error'
import { CLEYaml } from '../types'
import { DefaultPath } from '../common/constants'
import { fromHexString, getPrefixPath, trimPrefix } from '../common/utils'
// import to from 'await-to-js'

// TODO: rm FormData & fs
// import FormData from 'form-data'
// import fs from 'node:fs'

const codegen = (libDSPName: string, mappingFileName: string, handleFuncName: string) => `
import { zkmain_lib, asmain_lib, registerHandle } from "@hyperoracle/cle-lib-test/dsp/${libDSPName}"
import { ${handleFuncName} } from "./${mappingFileName}"

declare function __call_as_start(): void;

export function zkmain(): void {
  __call_as_start();
  registerHandle(${handleFuncName})
  return zkmain_lib()
}

export function asmain(): Uint8Array {
  __call_as_start();
  registerHandle(${handleFuncName})
  return asmain_lib()
}
function abort(a: usize, b: usize, c: u32, d: u32): void {}
`
// TODO: merge codegen_local & codegen into 1 var
const codegen_local = (libDSPName: string, mappingFileName: string, handleFuncName: string) => `
import { zkmain_lib, asmain_lib, registerHandle } from "@hyperoracle/cle-lib-test/dsp/${libDSPName}"
import { ${handleFuncName} } from "./${mappingFileName}"

export function zkmain(): void {
  registerHandle(${handleFuncName})
  return zkmain_lib()
}

export function asmain(): Uint8Array {
  registerHandle(${handleFuncName})
  return asmain_lib()
}
function abort(a: usize, b: usize, c: u32, d: u32): void {}
`

function getAbortTsFilepath(innerTsFilePath: string) {
  return `${innerTsFilePath.replace('.ts', '')}/abort`.replaceAll('\\', '/')
}

const getCompilerOptions = (isLocal = false) => {
  const options: string[] = []
  options.push('--optimize')
  options.push('--noAssert')
  options.push('--exportRuntime')
  options.push('--disable', 'bulk-memory')
  options.push('--disable', 'mutable-globals')
  if (!isLocal)
    options.push('--exportStart', '__as_start')
  options.push('--memoryBase', '70000')
  options.push('--target', 'release')
  options.push('--runtime', 'stub')
  return options
}

export interface CompileResult {
  outputs: Record<string, string | Uint8Array>
  /** Encountered error, if any. */
  error: Error | null
  /** Standard output stream. */
  stdout: any
  /** Standard error stream.  */
  stderr: any
  /** Statistics. */
  stats: any
}

export function onlyAscCompile(yaml: CLEYaml) {
  return !yaml.dataSources.some((dataSource: { kind: any; unsafe?: boolean }) => dataSource.kind === 'ethereum' && dataSource.unsafe !== true)
  // let noETHSafe = true
  // yaml.dataSources.forEach((dataSource: { kind: any; unsafe?: boolean }) => {
  //   if (dataSource.kind === 'ethereum') {
  //     if (dataSource.unsafe !== true)
  //       noETHSafe = false
  //   }
  // })
  // return noETHSafe
}

export interface CompileOptions {
  yamlPath?: string
  isLocal?: boolean
  outWatPath?: string
  outWasmPath?: string
  compilerServerEndpoint?: string
}

export async function compile(
  // cleExecutable: Omit<CLEExecutable, 'wasmUint8Array'>,
  sources: Record<string, string>,
  options: CompileOptions = {},
): Promise<CompileResult> {
  // Decide if only need to compile locally by yaml config
  const {
    isLocal = false,
    yamlPath = DefaultPath.yaml,
  } = options
  // const { cleYaml } = cleExecutable
  const cleYaml = CLEYaml.fromYamlContent(sources[yamlPath])
  if (onlyAscCompile(cleYaml))
    options.isLocal = true

  // cache final out path
  const {
    outWasmPath = DefaultPath.outWasm,
    outWatPath = DefaultPath.outWat,
  } = options
  const finalOutWasmPath = outWasmPath
  const finalOutWatPath = outWatPath

  // compile locally with asc, use inner path if isLocal
  if (isLocal) {
    options.outWasmPath = DefaultPath.outInnerWasm
    options.outWatPath = DefaultPath.outInnerWat
  }
  let result = await compileAsc(sources, options)

  // compile remotely on the compiler server if needed, using final out path
  if (options.isLocal === false) {
    const outWasm = result.outputs[options.outWasmPath as string] as Uint8Array
    // @murong: TODO: complete this func
    const innerCLEExecutable = { wasmUint8Array: outWasm, cleYaml }
    options.outWasmPath = finalOutWasmPath
    options.outWatPath = finalOutWatPath
    result = await compileServer(innerCLEExecutable, options)
  }
  return result
}

export async function compileAsc(
  // cleExecutable: Omit<CLEExecutable, 'wasmUint8Array'>,
  sources: Record<string, string>,
  options: CompileOptions = {},
): Promise<CompileResult> {
  // const { cleYaml } = cleExecutable
  const {
    isLocal = false,
    yamlPath = DefaultPath.yaml,
    outWasmPath = isLocal ? DefaultPath.outInnerWasm : DefaultPath.outWasm,
    outWatPath = isLocal ? DefaultPath.outInnerWat : DefaultPath.outWat,
  } = options

  // TODO: complete this func
  const cleYaml = CLEYaml.fromYamlContent(sources[yamlPath])
  const dsp = dspHub.getDSPByYaml(cleYaml, { isLocal: false }) // deprecating isLocal, 'false' for compatible
  if (!dsp)
    throw new DSPNotFound('Can\'t find DSP for this data source kind.')

  const libDSPName = dsp.getLibDSPName()
  const mappingFileName = getPrefixPath(yamlPath) + trimPrefix(cleYaml.mapping.file, './')
  const handleFuncName = cleYaml.mapping.handler

  const entryFilePath = `entry_${randomStr()}.ts`
  const abortPath = getAbortTsFilepath(entryFilePath)
  const asc = await import('assemblyscript/dist/asc.js')
  const stdout = asc.createMemoryStream()
  const outputs: Record<string, string | Uint8Array> = {}
  sources = {
    ...sources,
    [entryFilePath]: isLocal ? codegen_local(libDSPName, mappingFileName, handleFuncName) : codegen(libDSPName, mappingFileName, handleFuncName),
  }
  const config = {
    stdout,
    stderr: stdout,
    readFile: (name: string) => hasOwnProperty(sources, name) ? sources[name] : null,
    writeFile: (name: string, contents: any) => { outputs[name] = contents },
    listFiles: () => [],
  }
  const compileOptions = [
    entryFilePath,
    '--path', 'node_modules',
    '--use', `abort=${abortPath}`,
    '--textFile', outWatPath,
    '--outFile', outWasmPath,
    ...getCompilerOptions(isLocal),
  ]
  const ascResult = await asc.main(compileOptions, config)
  return {
    outputs,
    ...ascResult,
  }
}

export async function compileServer(
  _innerCLEExecutable: CLEExecutable,
  options: CompileOptions = {},
): Promise<CompileResult> {
  // @murong enable this when complete
  // const { _wasmUint8Array, _cleYaml } = innerCLEExecutable

  const {
    compilerServerEndpoint,
    outWasmPath = DefaultPath.outWasm,
    outWatPath = DefaultPath.outWat,
  } = options

  const outputs: Record<string, string | Uint8Array> = {}

  if (compilerServerEndpoint === undefined)
    throw new MissingRequiredOptions('compilerServerEndpoint is required')

  // @murong: TODO: try fill 'data' with wasmUint8Array, cleYaml
  // Set up form data
  const data = new FormData()
  // data.append('wasmFile', fs.createReadStream(tmpWasmPath))
  // data.append('yamlFile', fs.createReadStream(yamlPath))

  const [requestErr, response] = await to(compileRequest(compilerServerEndpoint, data))
  // const response = await compileRequest(compilerServerEndpoint, data)

  // @murong: TODO: keep this err log outside of api
  // if (requestErr) {
  //   console.error(requestErr)
  //   logger.error(`[-] ERROR WHEN COMPILING. ${requestErr.message}`)
  //   return false
  // }
  if (!response) { // rarely happen
    // logger.error('[-] ERROR WHEN COMPILING. invalid response')
    // return false
    throw new Error('ERROR WHEN COMPILING. invalid response')
  }
  const outWasmHex = response.data.wasmModuleHex
  const outWat = response.data.wasmWat

  outputs[outWasmPath] = fromHexString(outWasmHex)
  outputs[outWatPath] = outWat

  // @murong: TODO: this should stay outside of api
  // createOnNonexist(wasmPath)
  // fs.writeFileSync(wasmPath, fromHexString(outWasmHex))

  // createOnNonexist(watPath)
  // fs.writeFileSync(watPath, outWat)

  return {
    outputs,
    error: requestErr,
    // @murong: try convert error to stderr / stdout to compatible with CompileResult
    stdout: null,
    stderr: null,
    stats: null,
  }
}

export async function compileRequest(endpoint: string, data: any) {
  // Set up request config
  const requestConfig: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: endpoint,
    headers: {
      ...data?.getHeaders(),
    },
    data,
    timeout: 50000,
  }

  return await axios.request(requestConfig)
}
