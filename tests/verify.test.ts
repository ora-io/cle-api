import { describe } from 'node:test'
import { expect, it } from 'vitest'
import { ethers } from 'ethers'
import * as cleapi from '../src/index'
import { AggregatorVerifierAddress } from '../src/common/constants'
import { loadYamlFromPath } from './utils/yaml'
import { fixtures } from './fixureoptions'
import { config } from './config'

(global as any).__BROWSER__ = false

const yamlPath = fixtures['dsp/ethereum(event)'].yamlPath
// const proveTaskId = 'v4YpdX4UufG89z2CwA26m0OS' // ora prover proof
const proveTaskId = '65dd7dad235cd47b5193efce' // zkwasmhub proof

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
      { verifierAddress, provider: new ethers.providers.JsonRpcProvider(config.JsonRpcProviderUrl[network]) },
    )).toBeTruthy()
  })
  // 2nd way to verify proof.
  it.only('test verify proof params', async () => {
    const proofParams = await cleapi.getVerifyProofParamsByTaskID(config.ZkwasmProviderUrl, proveTaskId)
    const network = 'sepolia'
    // const verifierAddress = '0x9B13520f499e95f7e94E8346Ed8F52D2F830d955' // ora verifier
    // const verifierAddress = '0xfD74dce645Eb5EB65D818aeC544C72Ba325D93B0' // zkwasmhub verifier

    expect(await cleapi.verifyProof(
      proofParams,
      {
        // verifierAddress,
        provider: new ethers.providers.JsonRpcProvider(config.JsonRpcProviderUrl[network]),
        // batchStyle: cleapi.BatchStyle.ORA_SINGLE
      },
    )).toBeTruthy()

    /// / make a wrong proof for test
    proofParams.aggregate_proof[0] = 0x12
    expect(await cleapi.verifyProof(
      proofParams,
      {
        // verifierAddress,
        provider: new ethers.providers.JsonRpcProvider(config.JsonRpcProviderUrl[network]),
        // batchStyle: cleapi.BatchStyle.ORA_SINGLE
      },
    )).toBeFalsy()
  }, {
    timeout: 1000000,
  })
})
