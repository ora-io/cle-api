import fs from 'node:fs'
import { CLEYaml } from '../../src'
export function loadYamlFromPath(path: string) {
  const fileContents = fs.readFileSync(path, 'utf8')
  return CLEYaml.fromYamlContent(fileContents)
}
