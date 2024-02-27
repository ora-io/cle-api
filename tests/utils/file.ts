import path from 'path'
import os from 'os'
import fs from 'fs'

export function createFileFromUint8Array(array: string | NodeJS.ArrayBufferView, fileName: string) {
  const tempDir = os.tmpdir()
  const filePath = path.join(tempDir, fileName)
  fs.writeFileSync(filePath, array as any)
  return fs.createReadStream(filePath)
}

export function createOnNonexist(filePath: string): void {
  const directoryPath = path.dirname(filePath)

  if (!fs.existsSync(directoryPath))
    fs.mkdirSync(directoryPath, { recursive: true })
}
