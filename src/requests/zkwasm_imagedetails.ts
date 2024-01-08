import { to } from '@murongg/utils'
import type { Image } from '@hyperoracle/zkwasm-service-helper'
import { ZkWasmServiceHelper } from '@hyperoracle/zkwasm-service-helper'

export async function zkwasm_imagedetails(zkwasmProverUrl: string, md5: string) {
  const helper = new ZkWasmServiceHelper(zkwasmProverUrl, '', '')
  const [errorMessage, response] = await to(helper.queryImage(md5.toUpperCase()))
  return [response, errorMessage] as ([Image, null] | [undefined, Error])
}
