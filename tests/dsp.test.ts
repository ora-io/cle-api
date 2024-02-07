import path from 'path'
import fs from 'fs'
import FormData from 'form-data'
import { describe, expect, it } from 'vitest'
import { objectKeys } from '@murongg/utils'
import webjson from '@hyperoracle/cle-lib-test/test/weblib/weblib.json'
import { providers } from 'ethers'
import { fromHexString, loadConfigByNetwork, toHexString } from '../src/common/utils'
import * as zkgapi from '../src/index'
import { DefaultPath } from '../src/common/constants'
import { loadYamlFromPath } from './utils/yaml'
import { config } from './config'

(global as any).__BROWSER__ = false

function readFile(filepath: string) {
  return fs.readFileSync(filepath, 'utf-8')
}
function createOnNonexist(filePath: string): void {
  const directoryPath = path.dirname(filePath)

  if (!fs.existsSync(directoryPath))
    fs.mkdirSync(directoryPath, { recursive: true })
}

// const dspname = 'ethereum.unsafe-ethereum'
// const dspExpectedState = '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794000000005c7a6cf20cbd3eef32e19b9cad4eca17c432a794', // use event return

const dspname = 'ethereum'
const dspExpectedState = '5c7a6cf20cbd3eef32e19b9cad4eca17c432a794'

// options per dsp
const execOptionsForDSP = {
  mappingPath: `tests/fixtures/dsp/${dspname}/mapping.ts`,
  yamlPath: `tests/fixtures/dsp/${dspname}/cle-event.yaml`,
  wasmPath: `tests/fixtures/compile/build/${dspname}.was`,
  watPath: `tests/fixtures/compile/build/${dspname}.wat`,
  local: false,
  expectedState: dspExpectedState,
  blocknum: {
    sepolia: 2279547, // to test event use 2279547, to test storage use latest blocknum
    mainnet: 17633573,
  },
  // expectedState: '6370902000000003336530047e5ec3da40c000000000068f1888e6eb7036fffe', // use storage return
  // blocknum: {
  //   sepolia: await getLatestBlocknumber(config.JsonRpcProviderUrl.sepolia),
  //   mainnet: await getLatestBlocknumber(config.JsonRpcProviderUrl.mainnet),
  // },
}

describe('test dsp: ethereum.unsafe-ethereum', () => {
  it('test compile', async () => {
    const { mappingPath, yamlPath, wasmPath, watPath } = execOptionsForDSP
    const cleYaml = loadYamlFromPath(yamlPath)
    if (!cleYaml)
      throw new Error('yaml is null')

    const sources = {
      ...webjson,
      'src/mapping.ts': readFile(mappingPath),
      'src/cle.yaml': readFile(yamlPath),
    }

    const result = await zkgapi.compile(sources)

    if (result.stderr.length > 0)
      throw new Error(result.stderr.toString())

    expect(result.error).toBeNull()
    expect(objectKeys(result.outputs).length).toBeGreaterThanOrEqual(1)
    const wasmContent = result.outputs[DefaultPath.outWasm]
    const watContent = result.outputs[DefaultPath.outWat]
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

  it('test_exec', async () => {
    const { wasmPath, yamlPath, local, expectedState, blocknum } = execOptionsForDSP

    const wasm = fs.readFileSync(wasmPath)
    const wasmUint8Array = new Uint8Array(wasm)
    // const yamlContent = fs.readFileSync(yamlPath, 'utf-8')
    const yaml = loadYamlFromPath(yamlPath) as zkgapi.CLEYaml
    const dsp = zkgapi.dspHub.getDSPByYaml(yaml, { isLocal: false })

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
