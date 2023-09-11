import { pinata_upload } from '../requests/pinata_upload.js';
import { loadZKGraphName } from '../common/config_utils.js';

/**
 * Upload the given zkgraph {$mappingPath, $yamlPath} to ipfs
 * @param {string} mappingPath
 * @param {string} wasmPath
 * @param {string} yamlPath
 * @param {string} userPrivateKey
 * @param {string} pinataEndpoint
 * @param {string} pinataJWT
 * @param {boolean} enableLog
 * @returns {boolean} - the upload result
 */
export async function upload(
  mappingPath,
  wasmPath,
  yamlPath,
  userPrivateKey,
  pinataEndpoint,
  pinataJWT,
  enableLog = true,
) {
  const zkGraphName =
    loadZKGraphName('src/zkgraph.yaml') === null
      ? 'zkGraph'
      : loadZKGraphName('src/zkgraph.yaml');

  let [response, isUploadSuccess, errorMessage] = await pinata_upload(
    userPrivateKey,
    wasmPath,
    mappingPath,
    yamlPath,
    zkGraphName,
    pinataEndpoint,
    pinataJWT,
  ).catch((error) => {
    throw error;
  });

  if (isUploadSuccess) {
    if (enableLog) {
      console.log(`[+] IPFS UPLOAD SUCCESS!`, '\n');
      console.log(`[+] IPFS HASH: ${response.data.IpfsHash}`, '\n');
      if (response.data.isDuplicate) {
        console.log(`[*] Please note that this upload is duplicated.`, '\n');
      }
    }

    return true;
  } else {
    if (enableLog) {
      console.log(`[-] IPFS UPLOAD FAILED.`, '\n');
      console.log(`[-] ${errorMessage}`, '\n');
    }

    return false;
  }
}
