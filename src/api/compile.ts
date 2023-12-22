import asc from 'assemblyscript/dist/asc'
import { hasOwnProperty } from '@murongg/utils'
const codegen = (libDSPName: string, mappingFileName: string, handleFuncName: string) => `
import { zkmain_lib, asmain_lib, registerHandle } from "@hyperoracle/zkgraph-lib/dsp/${libDSPName}"
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

function getAbortTsFilepath(innerTsFilePath: string) {
  return `${innerTsFilePath.replace('.ts', '')}/abort`.replaceAll('\\', '/')
}

const getCompilerOptions = () => {
  const options = []
  options.push('--optimize')
  options.push('--noAssert')
  options.push('--exportRuntime')
  options.push('--disable', 'bulk-memory')
  options.push('--disable', 'mutable-globals')
  options.push('--exportStart', '__as_start')
  options.push('--memoryBase', '70000')
  options.push('--target', 'release')
  options.push('--runtime', 'stub')
  return options
}

export interface CompileResult extends asc.APIResult {
  outputs: Record<string, string | Uint8Array>
}

export async function compile(tsModule: string, libDSPName: string, mappingFileName: string, handleFuncName: string, sources: Record<string, string>): Promise<CompileResult> {
  const textModule = 'inner_pre_pre.wat'
  const wasmModule = 'inner_pre_pre.wasm'
  const abortPath = getAbortTsFilepath(tsModule)
  const stdout = asc.createMemoryStream()
  const outputs: Record<string, string | Uint8Array> = {}
  sources = {
    ...sources,
    [tsModule]: codegen(libDSPName, mappingFileName, handleFuncName),
  }
  const config: asc.APIOptions = {
    stdout,
    stderr: stdout,
    readFile: name => hasOwnProperty(sources, name) ? sources[name] : null,
    writeFile: (name, contents) => { outputs[name] = contents },
    listFiles: () => [],
  }
  const options = [
    tsModule,
    '--path', 'node_modules',
    '--use', `abort=${abortPath}`,
    '--textFile', textModule,
    '--outFile', wasmModule,
    ...getCompilerOptions(),
  ]
  const ascResult = await asc.main(options, config)
  return {
    outputs,
    ...ascResult,
  }
}
