import fs from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { randomStr } from '@murongg/utils'

export interface BrowserStreamParam {
  fileType?: string
  fileName?: string
}

export interface NodeStreamParam {
  tmpPath?: string
}

export function createFileStream(content: any, param: BrowserStreamParam & NodeStreamParam) {
  if (__BROWSER__) {
    const { fileType, fileName } = param
    if (fileType === undefined || fileName === undefined)
      throw new Error(`missing fileType or fileName in createFileStream, given: ${fileType?.toString()} ${fileName?.toString()}`)

    const blob = new Blob([content], { type: fileType })
    return new File([blob], fileName, { type: fileType })
  }
  else {
    let { tmpPath } = param
    if (tmpPath === undefined)
      tmpPath = path.join(tmpdir(), `cle_createFileStream_${randomStr()}`)
    fs.writeFileSync(tmpPath, content)
    return fs.createReadStream(tmpPath)
  }
}
