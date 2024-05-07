import { describe } from 'node:test'
import { expect, it } from 'vitest'
import { ethers } from 'ethers'
import * as cleapi from '../src/index'
import { AggregatorVerifierAddress } from '../src/common/constants'
import { loadYamlFromPath } from './utils/yaml'
import { fixtures } from './fixureoptions'
import { config } from './config'

(global as any).__BROWSER__ = false

const rpcUrl = 'https://rpc.ankr.com/eth_sepolia'

const yamlPath = fixtures['dsp/ethereum(event)'].yamlPath
// let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
const proveTaskId = '65dd7dad235cd47b5193efce' // true
// const proveTaskId = '65d1c1edc3e455a0eebd7bb6' // fasle

describe('test verify', () => {
  const cleYaml = loadYamlFromPath(yamlPath)

  it('test verify CLEExecutable', async () => {
    const verifyParams = await cleapi.getVerifyProofParamsByTaskID(config.ZkwasmProviderUrl, proveTaskId)

    const network = cleYaml.decidePublishNetwork()
    expect(network).toBeDefined()
    if (network === undefined)
      throw new Error('network is undefined')

    // const verifierContractAddress = loadConfigByNetwork(cleYaml as CLEYaml, AggregatorVerifierAddress, false)
    const verifierAddress = (AggregatorVerifierAddress as any)[network]
    expect(await cleapi.verify(
      verifyParams,
      { verifierAddress, provider: new ethers.providers.JsonRpcProvider(rpcUrl) },
    )).toBeTruthy()
  })
  // 2nd way to verify proof.
  it('test verify proof params', async () => {
    const proofParams = await cleapi.getVerifyProofParamsByTaskID(config.ZkwasmProviderUrl, proveTaskId)
    const sepolia_verifier = '0xfD74dce645Eb5EB65D818aeC544C72Ba325D93B0'
    expect(await cleapi.verifyProof(
      proofParams,
      { verifierAddress: sepolia_verifier, provider: new ethers.providers.JsonRpcProvider(rpcUrl) },
    )).toBeTruthy()

    // make a wrong proof
    proofParams.aggregate_proof[0] = 0x12
    expect(await cleapi.verifyProof(
      proofParams,
      { verifierAddress: sepolia_verifier, provider: new ethers.providers.JsonRpcProvider(rpcUrl) },
    )).toBeFalsy()
  }, {
    timeout: 1000000,
  })
})
