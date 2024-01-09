import fs from 'node:fs'
import { CLEYaml } from '../../src'
export function loadYamlFromPath(path: string) {
  let fileContents = ''
  try {
    // Read the YAML file contents
    fileContents = fs.readFileSync(path, 'utf8')
  }
  catch (error) {
    console.error(error)
  }
  return CLEYaml.fromYamlContent(fileContents)
}
