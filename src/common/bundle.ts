/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-console */
import { ZKWASMMock } from './zkwasm_mock.js'

let zkwasmmock: ZKWASMMock

export function setupZKWasmMock(mock: ZKWASMMock) {
  zkwasmmock = mock
}

// eslint-disable-next-line import/no-mutable-exports
export let hasDebugOnlyFunc = false

async function instantiate(module: BufferSource, imports: Record<string, any> = {}) {
  hasDebugOnlyFunc = false

  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      'wasm_write_context': function (_: number) {
        // pass
      },
      'console.log': function (text?: string | null) {
        if (!text)
          return
        // ~lib/bindings/dom/console.log(~lib/string/String) => void
        text = __liftString((text as any) >>> 0)
        console.log(text)
        hasDebugOnlyFunc = true
      },
      require(x: 0 | 1) {
        // sdk/zkwasm/require1(i32) => i64
        ZKWASMMock.require(x)
      },
      wasm_input(x: 0 | 1) {
        // lib/common/zkwasm/wasm_input(i32) => i64
        return zkwasmmock?.wasm_input(x) || 0n
      },
      js_log(arg: any) {
        // to compatible with c-wasm
        console.log(arg)
      },
      js_log_u64(arg: any) {
        // to compatible with c-wasm
        console.log(arg)
      },
      //   printDec(arg) {
      //     process.stdout.write(arg);
      //   },
      //   printHex(arg) {
      //     process.stdout.write(arg.toString(16));
      //   },
      //   printSp() {
      //     process.stdout.write(' ');
      //   },
      //   printLn() {
      //     console.log();
      //   },
      //   c_log(arg) {
      //     // to compatible with c-wasm
      //     console.log('c_log: ', arg);
      //   },
    }),
  }
  const { exports } = await WebAssembly.instantiate(module, adaptedImports) as any
  const memory = exports.memory || imports.env.memory
  const adaptedExports = Object.setPrototypeOf(
    {
      asmain_local(rawreceipts: any, matched_event_offsets: any) {
        // lib/main_local/asmain(~lib/typedarray/Uint8Array, ~lib/typedarray/Uint32Array) => ~lib/typedarray/Uint8Array
        rawreceipts = __retain(
          __lowerTypedArray(Uint8Array, 4, 0, rawreceipts) || __notnull(),
        )
        matched_event_offsets
          = __lowerTypedArray(Uint32Array, 5, 2, matched_event_offsets)
          || __notnull()
        try {
          return __liftTypedArray(
            Uint8Array,
            exports.asmain(rawreceipts, matched_event_offsets) >>> 0,
          )
        }
        finally {
          __release(rawreceipts)
        }
      },
      asmain() {
        // dev: always throw for zkgraph debug purpose.
        // try {
        return __liftTypedArray(
          Uint8Array,
          exports.asmain() >>> 0,
        )
        // }
        // catch (e) {throw e}

        // finally {}
      },
    },
    exports,
  )
  function __liftString(pointer: number) {
    if (!pointer)
      return null
    const end
      = (pointer + new Uint32Array(memory.buffer)[(pointer - 4) >>> 2]) >>> 1
    const memoryU16 = new Uint16Array(memory.buffer)
    let start = pointer >>> 1
    let string = ''
    while (end - start > 1024) {
      string += String.fromCharCode(
        ...memoryU16.subarray(start, (start += 1024)),
      )
    }
    return string + String.fromCharCode(...memoryU16.subarray(start, end))
  }
  function __liftTypedArray(constructor: Uint8ArrayConstructor, pointer: number) {
    if (!pointer)
      return null
    return new constructor(
      memory.buffer,
      __getU32(pointer + 4),
      __dataview.getUint32(pointer + 8, true) / constructor.BYTES_PER_ELEMENT,
    ).slice()
  }
  function __lowerTypedArray(constructor: Uint8ArrayConstructor | Uint32ArrayConstructor, id: number, align: number, values: any[] | null) {
    if (values == null)
      return 0
    const length = values.length
    const buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0
    const header = exports.__new(12, id) >>> 0
    __setU32(header + 0, buffer)
    __dataview.setUint32(header + 4, buffer, true)
    __dataview.setUint32(header + 8, length << align, true)
    new constructor(memory.buffer, buffer, length).set(values)
    exports.__unpin(buffer)
    return header
  }
  const refcounts = new Map()
  function __retain(pointer: number | void) {
    if (pointer) {
      const refcount = refcounts.get(pointer)
      if (refcount)
        refcounts.set(pointer, refcount + 1)
      else refcounts.set(exports.__pin(pointer), 1)
    }
    return pointer
  }
  function __release(pointer: any) {
    if (pointer) {
      const refcount = refcounts.get(pointer)
      if (refcount === 1) { exports.__unpin(pointer); refcounts.delete(pointer) }
      else if (refcount) { refcounts.set(pointer, refcount - 1) }
      else {
        throw new Error(
          `invalid refcount '${refcount}' for reference '${pointer}'`,
        )
      }
    }
  }
  function __notnull() {
    throw new TypeError('value must not be null')
  }
  let __dataview = new DataView(memory.buffer)
  function __setU32(pointer: number, value: number) {
    try {
      __dataview.setUint32(pointer, value, true)
    }
    catch {
      __dataview = new DataView(memory.buffer)
      __dataview.setUint32(pointer, value, true)
    }
  }
  function __getU32(pointer: number) {
    try {
      return __dataview.getUint32(pointer, true)
    }
    catch {
      __dataview = new DataView(memory.buffer)
      return __dataview.getUint32(pointer, true)
    }
  }
  return adaptedExports
}
// export const { memory, asmain, zkmain } = await (async (url) =>
//   instantiate(
//     await (async () => {
//       try {
//         return await globalThis.WebAssembly.compileStreaming(
//           globalThis.fetch(url),
//         );
//       } catch {
//         return globalThis.WebAssembly.compile(
//           await (await import("node:fs/promises")).readFile(url),
//         );
//       }
//     })(),
//     {},
//   ))(new URL("../../build/zkgraph_full.wasm", import.meta.url));

export const instantiateWasm = async (wasmUint8Array: Uint8Array) => {
  return instantiate(
    // @ts-expect-error TODO: fix this
    await (async () => {
      // try {
      //   return await globalThis.WebAssembly.compileStreaming(
      //     globalThis.fetch(url),
      //   );
      // }
      // catch {
      return globalThis.WebAssembly.compile(
        wasmUint8Array.buffer,
      )
      // }
    })(),
    {},
  )
}
