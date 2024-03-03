import type { Nullable } from '@murongg/utils'
import { hasOwnProperty, isFunction, randomStr, to } from '@murongg/utils'
import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import FormData from 'form-data'
import type { CLEExecutable } from '../types'
import { dspHub } from '../dsp/hub'
import { DSPNotFound } from '../common/error'
import { CLEYaml } from '../types'
import { DEFAULT_PATH, DEFAULT_URL } from '../common/constants'
import { fromHexString, getPrefixPath, trimPrefix } from '../common/utils'
import { createFileStream } from '../common/compatible'

const codegen = (libDSPName: string, mappingFileName: string, handleFuncName: string) => `
import { zkmain_lib, asmain_lib, registerHandle } from "@ora-io/cle-lib/dsp/${libDSPName}"
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
import { zkmain_lib, asmain_lib, registerHandle } from "@ora-io/cle-lib/dsp/${libDSPName}"
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
  error: Nullable<Error>
  /** Standard output stream. */
  stdout: Nullable<OutputStream>
  /** Standard error stream.  */
  stderr: Nullable<OutputStream>
  /** Statistics. */
  stats: any
}

export interface OutputStream {
  /** Writes a chunk of data to the stream. */
  write(chunk: Uint8Array | string): void
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
  outWatPath?: string
  outWasmPath?: string
  outInnerWasmPath?: string // optional
  outInnerWatPath?: string // optional
  compilerServerEndpoint?: string
  isLocal?: boolean
}

export async function compile(
  // cleExecutable: Omit<CLEExecutable, 'wasmUint8Array'>,
  sources: Record<string, string>,
  options: CompileOptions = {},
): Promise<CompileResult> {
  // Decide if only need to compile locally by yaml config
  const { yamlPath = DEFAULT_PATH.YAML } = options
  // const { cleYaml } = cleExecutable
  const cleYamlContent = sources[yamlPath]
  const cleYaml = CLEYaml.fromYamlContent(sources[yamlPath])
  if (onlyAscCompile(cleYaml))
    options.isLocal = true

  // cache final out path
  const {
    isLocal = false,
    outInnerWasmPath = DEFAULT_PATH.OUT_INNER_WASM,
    outInnerWatPath = DEFAULT_PATH.OUT_INNER_WAT,
  } = options
  options.outWasmPath = options.outWasmPath || DEFAULT_PATH.OUT_WASM
  options.outWatPath = options.outWatPath || DEFAULT_PATH.OUT_WAT
  const finalOutWasmPath = options.outWasmPath
  const finalOutWatPath = options.outWatPath

  // compile locally with asc, use inner path if isLocal==false
  if (isLocal === false) {
    options.outWasmPath = outInnerWasmPath
    options.outWatPath = outInnerWatPath
  }
  const result = await compileAsc(sources, options)
  if (result.error)
    return result

  // compile remotely on the compiler server if needed, using final out path
  if (isLocal === false) {
    const outWasm = result.outputs[options.outWasmPath as string] as Uint8Array
    const innerCLEExecutable = { wasmUint8Array: outWasm, cleYaml }
    // options.outInnerWasmPath = options.outWasmPath
    options.outWasmPath = finalOutWasmPath
    options.outWatPath = finalOutWatPath
    return await compileServer(innerCLEExecutable, cleYamlContent, options)
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
    yamlPath = DEFAULT_PATH.YAML,
    outWasmPath = isLocal ? DEFAULT_PATH.OUT_INNER_WASM : DEFAULT_PATH.OUT_WASM,
    outWatPath = isLocal ? DEFAULT_PATH.OUT_INNER_WAT : DEFAULT_PATH.OUT_WAT,
  } = options

  // TODO: complete this func
  const cleYaml = CLEYaml.fromYamlContent(sources[yamlPath])
  const dsp = dspHub.getDSPByYaml(cleYaml) // deprecating isLocal, 'false' for compatible
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
  // console.log('sources',Object.keys(sources))
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
  innerCLEExecutable: Omit<CLEExecutable, 'cleYaml' >,
  cleYamlContent: string,
  options: CompileOptions = {},
): Promise<CompileResult> {
  const { wasmUint8Array } = innerCLEExecutable
  const {
    compilerServerEndpoint = DEFAULT_URL.COMPILER_SERVER,
    outWasmPath = DEFAULT_PATH.OUT_WASM,
    outWatPath = DEFAULT_PATH.OUT_WAT,
  } = options

  const outputs: Record<string, string | Uint8Array> = {}
  // Set up form data
  const data = new FormData()

  data.append('wasmFile', createFileStream(wasmUint8Array, { fileType: 'application/wasm', fileName: 'inner.wasm' })) // , tmpPath: outInnerWasmPath rm since paths may be abstract
  data.append('yamlFile', createFileStream(cleYamlContent, { fileType: 'text/yaml', fileName: 'src/cle.yaml' }))
  // if (__BROWSER__) {

  //   // const blob = new Blob([wasmUint8Array], { type: 'application/wasm' })
  //   // const wasmFile = new File([blob], 'inner.wasm', { type: 'application/wasm' })
  //   data.append('wasmFile', createFileStream(wasmUint8Array, 'application/wasm', 'inner.wasm'))
  //   data.append('yamlFile', createFileStream(cleYamlContent, 'text/yaml', 'src/cle.yaml'))
  //   // const yamlFile = new File([new Blob([cleYamlContent], { type: 'text/yaml' })], 'src/cle.yaml', { type: 'text/yaml' })
  //   // data.append('yamlFile', yamlFile)
  // }
  // else {
  //   const tmpPath = path.join(tmpdir(), `cle_${randomStr()}.yaml`)
  //   fs.writeFileSync(tmpPath, cleYamlContent)
  //   fs.writeFileSync(outInnerWasmPath, wasmUint8Array)

  //   data.append('wasmFile', fs.createReadStream(outInnerWasmPath))
  //   data.append('yamlFile', fs.createReadStream(tmpPath))
  // }

  const [requestErr, response] = await to(compileRequest(compilerServerEndpoint, data))
  if (requestErr)
    throw requestErr

  if (!response) {
    // rarely happen
    throw new Error('ERROR WHEN COMPILING. invalid response')
  }
  const outWasmHex = response.data.wasmModuleHex
  const outWat = response.data.wasmWat

  outputs[outWasmPath] = fromHexString(outWasmHex)
  outputs[outWatPath] = outWat

  return {
    outputs,
    error: null,
    stdout: null,
    stderr: null,
    stats: null,
  }
}

export async function compileRequest(endpoint: string, data: any) {
  // Set up request config
  const headers = data && isFunction(data.getHeaders) ? data?.getHeaders() : {}
  const requestConfig: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: endpoint,
    headers: {
      ...headers,
    },
    data,
    timeout: 50000,
  }

  return await axios.request(requestConfig)
}
