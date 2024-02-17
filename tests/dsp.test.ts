import fs from 'fs'
import FormData from 'form-data'
import { describe, expect, it } from 'vitest'
import { objectKeys } from '@murongg/utils'
import webjson from '@ora-io/cle-lib/test/weblib/weblib.json'
import { providers } from 'ethers'
import { fromHexString, loadConfigByNetwork, toHexString } from '../src/common/utils'
import * as zkgapi from '../src/index'
import { DEFAULT_PATH } from '../src/common/constants'
import { loadYamlFromPath } from './utils/yaml'
import { config } from './config'
import { fixtures } from './fixureoptions'
import { createOnNonexist } from './utils/file'

(global as any).__BROWSER__ = false

function readFile(filepath: string) {
  return fs.readFileSync(filepath, 'utf-8')
}

// const pathfromfixtures = 'dsp/ethereum(storage)'
const pathfromfixtures = 'dsp/ethereum.unsafe-ethereum'
const option = fixtures[pathfromfixtures]

describe(`test dsp: ${pathfromfixtures}`, () => {
  it('test compile', async () => {
    const { mappingPath, yamlPath, wasmPath, watPath } = option
    const cleYaml = loadYamlFromPath(yamlPath)
    if (!cleYaml)
      throw new Error('yaml is null')

    const sources = {
      ...webjson,
      'src/mapping.ts': readFile(mappingPath),
      'src/cle.yaml': readFile(yamlPath),
    }

    const result = await zkgapi.compile(sources)

    if ((result?.stderr as any)?.length > 0)
      throw new Error(result?.stderr?.toString())

    expect(result.error).toBeNull()
    expect(objectKeys(result.outputs).length).toBeGreaterThanOrEqual(1)
    const wasmContent = result.outputs[DEFAULT_PATH.OUT_WASM]
    const watContent = result.outputs[DEFAULT_PATH.OUT_WAT]
    expect(wasmContent).toBeDefined()
    expect(watContent).toBeDefined()

    // TODO: only write once at the end of "compile test", unnecessary to write these tmp files if complete zkgapi.compile
    // optional: output compile result for further exec test
    createOnNonexist(wasmPath)
    fs.writeFileSync(wasmPath, wasmContent)
    fs.writeFileSync(watPath, watContent)

    /**
     * TODO: move this into zkgapi.compile
    */
    // Set up form data
    const data = new FormData()
    // data.append("asFile", createReadStream(mappingPath));
    data.append('wasmFile', fs.createReadStream(wasmPath))
    data.append('yamlFile', fs.createReadStream(yamlPath))

    if (zkgapi.onlyAscCompile(cleYaml) === false) {
      // Note: the style is random pick, can align with cli compile
      // console.log('remote compile')
      await zkgapi.compileRequest(config.CompilerServerEndpoint, data)
        .then((response) => {
          const wasmModuleHex = response.data.wasmModuleHex
          const wasmWat = response.data.wasmWat

          createOnNonexist(wasmPath)
          fs.writeFileSync(wasmPath, fromHexString(wasmModuleHex))

          createOnNonexist(watPath)
          fs.writeFileSync(watPath, wasmWat)
        })
    }
    /**
     * end of TODO
     */
  }, { timeout: 100000 })

  it('test exec', async () => {
    const { wasmPath, yamlPath, local, expectedState, blocknum } = option

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { })
    // const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

    const jsonRpcUrl = loadConfigByNetwork(yaml, config.JsonRpcProviderUrl, true)
    const provider = new providers.JsonRpcProvider(jsonRpcUrl)
    const generalParams = {
      provider,
      blockId: loadConfigByNetwork(yaml, blocknum, true), // for storage
      // blockId: loadConfigByNetwork(yaml, blocknumForEventTest, true), // for event
    }

    const execParams = dsp?.toExecParams(generalParams)

    const state = await zkgapi.execute(
      { wasmUint8Array, cleYaml: yaml },
      execParams as any,
      local,
    )
    // console.log(toHexString(state))

    expect(toHexString(state)).toEqual(expectedState)
    return state
  }, { timeout: 100000 })
})
