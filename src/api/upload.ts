import { pinata_upload } from '../requests/pinata_upload'

/**
 * Upload the given zkgraph {$mappingPath, $yamlPath} to ipfs
 * @param {string} mappingPath
 * @param {string} wasmPath
 * @param {string} yamlPath
 * @param {string} userAddress
 * @param {string} pinataEndpoint
 * @param {string} pinataJWT
 * @returns {boolean} - the upload result
 */
export async function upload(
  mappingPath: string,
  wasmPath: string,
  yamlPath: string,
  // userAddress,
  pinataEndpoint: string,
  pinataJWT: string,
) {
  // const zkGraphName =
  //   loadZKGraphName('src/zkgraph.yaml') === null
  //     ? 'zkGraph'
  //     : loadZKGraphName('src/zkgraph.yaml');

  if (!__BROWSER__) {
    const [response, isUploadSuccess, errorMessage] = await pinata_upload(
      // userAddress,
      wasmPath,
      mappingPath,
      yamlPath,
      // zkGraphName,
      pinataEndpoint,
      pinataJWT,
    ).catch((error) => {
      throw error
    })

    return {
      response,
      isUploadSuccess,
      errorMessage,
    }
  }
  else {
    return {}
  }
}
