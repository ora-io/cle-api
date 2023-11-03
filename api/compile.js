import { execSync } from "child_process";
import { createReadStream, readFileSync, writeFileSync } from "fs";
import { loadZKGraphEventSources } from "../common/config_utils.js";
import { concatHexStrings, fromHexString } from "../common/utils.js";
import axios from "axios";
import FormData from "form-data";
import { loadYamlContent } from "../common/config_utils.js";

const innerPrePrePath = 'build/tmp/inner_pre_pre.wasm'

const wasmStartName = "__as_start"

export function compileInner(srcPath){
    const commands = [
      `npx asc node_modules/@hyperoracle/zkgraph-lib/main_event_full.ts -o ${innerPrePrePath} --runtime stub --use abort=node_modules/@hyperoracle/zkgraph-lib/common/type/abort --disable bulk-memory --disable mutable-globals --exportRuntime --exportStart ${wasmStartName}  --memoryBase 70000 --lib ${srcPath}`,
    ];

    const combinedCommand = commands.join(" && ");

    try {
      execSync(combinedCommand, { encoding: "utf-8" });
    } catch (error) {
      throw error;
    }
}

/**
 * Compile the given zkgraph {$srcPath, $yamlPath}
 * @param {string} wasmPath
 * @param {string} watPath
 * @param {string} srcPath
 * @param {string} yamlPath
 * @param {string} compilerServerEndpoint
 * @param {boolean} isLocal
 * @param {boolean} enableLog
 * @returns {boolean} - the upload result
 */
export async function compile(wasmPath, watPath, srcPath, yamlPath, compilerServerEndpoint, isLocal = false, enableLog=true) {
  let isCompilationSuccess = true;

  // TODO: check existence of node_modules/@hyperoracle/zkgraph-lib, if not, return error msg

  let yamlContent = readFileSync(yamlPath);

  let yaml = loadYamlContent(yamlContent);

  if(yaml.dataSources[0].event) {
      // Local Compile
      if (isLocal === true) {
        const commands = [
          `npx asc node_modules/@hyperoracle/zkgraph-lib/main_event_local.ts -t ${watPath} -O --noAssert -o ${wasmPath} --disable bulk-memory --use abort=node_modules/@hyperoracle/zkgraph-lib/common/type/abort --exportRuntime --runtime stub --memoryBase 70000 --lib ${srcPath}`, // note: need --exportRuntime or --bindings esm; (--target release)
        ];
        const combinedCommand = commands.join(" && ");

        try {
          execSync(combinedCommand, { encoding: "utf-8" });
          isCompilationSuccess = true;
        } catch (error) {
          isCompilationSuccess = false;
          throw error;
        }

      }
      // Remote Compile
      else {
        // Load config
        const [source_address, source_esigs] = loadZKGraphEventSources(yamlContent);
        if (enableLog === true) {
          console.log("[*] Source contract address:", source_address);
          console.log("[*] Source events signatures:", source_esigs, "\n");
        }

        compileInner(srcPath);


        // Set up form data
        let data = new FormData();
        data.append("wasmFile", createReadStream(innerPrePrePath));
        data.append("yamlFile", createReadStream(yamlPath));

        // Set up request config
        let requestConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: compilerServerEndpoint,
          headers: {
            ...data.getHeaders(),
          },
          data: data,
        };

        // Send request
        const response = await axios.request(requestConfig).catch((error) => {
          throw error;
          // if (enableLog === true) {
          //   console.log(`[-] ${error.message} ${error.code}`);
          // }
          // isCompilationSuccess = false;
        });

        if (isCompilationSuccess) {
          // save file to config.WasmBinPath
          const wasmModuleHex = response.data["wasmModuleHex"];
          const wasmWat = response.data["wasmWat"];
          const message = response.data["message"];
          writeFileSync(wasmPath, fromHexString(wasmModuleHex))
          writeFileSync(watPath, wasmWat)
        }
      }
  } else if (yaml.dataSources[0].storage) {
    // Local&Full are the same for now
    const commands = [
      `npx asc node_modules/@hyperoracle/zkgraph-lib/main_state.ts -t ${watPath} -O --noAssert -o ${wasmPath} --disable bulk-memory --use abort=~lib/@hyperoracle/zkgraph-lib/common/type/abort --exportRuntime --runtime stub --memoryBase 70000 --lib ${srcPath}`, // note: need --exportRuntime or --bindings esm; (--target release)
    ];
    const combinedCommand = commands.join(" && ");

    try {
      execSync(combinedCommand, { encoding: "utf-8" });
      isCompilationSuccess = true;
    } catch (error) {
      isCompilationSuccess = false;
      throw error;
    }
  } else {
    console.error("[-] yaml doesn't have event or storage in dataSources[0]");
    process.exit(1);
  }

  if (enableLog === true) {
      // Log and return result
      if (isCompilationSuccess === true) {
          // Log compiled file size by line count
          const compiledFileContent = readFileSync(watPath, "utf-8");
          const compiledFileLineCount = compiledFileContent.split("\n").length;
          console.log(
            "[*]",
            compiledFileLineCount,
            compiledFileLineCount > 1 ? "lines" : "line",
            `in ${watPath}`
          );
          // Log status
          console.log("[+] Output written to `build` folder.");
          console.log("[+] COMPILATION SUCCESS!", "\n");
      } else {
          // Log status
          console.log("\n" + "[-] ERROR WHEN COMPILING." + "\n");
      }
  }

  return isCompilationSuccess
}
