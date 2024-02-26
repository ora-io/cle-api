import { describe } from 'node:test'
import { expect, it } from 'vitest'
import { ethers } from 'ethers'
import * as zkgapi from '../src/index'
import { AggregatorVerifierAddress, DEFAULT_URL } from '../src/common/constants'
import { loadYamlFromPath } from './utils/yaml'

(global as any).__BROWSER__ = false

const rpcUrl = 'https://rpc.ankr.com/eth_sepolia'

const yamlPath = 'tests/testsrc/cle-event.yaml'
// let ZkwasmProviderUrl = "https://zkwasm-explorer.delphinuslab.com:8090"
// let proveTaskId = "6554584c82ab2c8b29dbc2c2" // true
const proveTaskId = '65d1c1edc3e455a0eebd7bb6' // fasle

describe('test verify', () => {
  const cleYaml = loadYamlFromPath(yamlPath)

  it('test verify CLEExecutable', async () => {
    const verifyParams = await zkgapi.getVerifyProofParamsByTaskID(DEFAULT_URL.ZKWASMHUB, proveTaskId)

    const network = cleYaml.decidePublishNetwork()
    console.log('network', network)
    expect(network).toBeDefined()
    if (network === undefined)
      throw new Error('network is undefined')

    // const verifierContractAddress = loadConfigByNetwork(cleYaml as CLEYaml, AggregatorVerifierAddress, false)
    const verifierAddress = (AggregatorVerifierAddress as any)[network]
    expect(await zkgapi.verify(
      verifyParams,
      { verifierAddress, provider: new ethers.providers.JsonRpcProvider(rpcUrl) },
    )).toBeTruthy()
  })
  // 2nd way to verify proof.
  it('test verify proof params', async () => {
    const proofParams = await zkgapi.getVerifyProofParamsByTaskID(DEFAULT_URL.ZKWASMHUB, proveTaskId)
    const sepolia_verifier = '0xfD74dce645Eb5EB65D818aeC544C72Ba325D93B0'
    expect(await zkgapi.verifyProof(
      proofParams,
      { verifierAddress: sepolia_verifier, provider: new ethers.providers.JsonRpcProvider(rpcUrl) },
    )).toBeTruthy()

    // make a wrong proof
    proofParams.aggregate_proof[0] = 0x12
    expect(await zkgapi.verifyProof(
      proofParams,
      { verifierAddress: sepolia_verifier, provider: new ethers.providers.JsonRpcProvider(rpcUrl) },
    )).toBeFalsy()
  })
})
