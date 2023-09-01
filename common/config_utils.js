import yaml from "js-yaml";
import fs from "fs";
import { ethers } from "ethers";

function loadYaml(fname) {
  try {
    // Read the YAML file contents
    const fileContents = fs.readFileSync(fname, "utf8");
    // Parse the YAML content
    return yaml.load(fileContents);
  } catch (error) {
    console.error(error);
  }
}

function healthCheck(yamlConfig){
    //TODO finish this
  for (let i in yamlConfig.dataSources[0].mapping.eventHandlers) {
    if (
        yamlConfig.dataSources[0].mapping.eventHandlers[i].handler != "handleEvents"
    ) {
      throw Error(
        "zkgraph.yaml: currently only support 'handleEvents' as handler function name.",
      );
    }
  }
}

export function loadZKGraphSources(fname) {
  const config = loadYaml(fname);
  healthCheck(config)
//   const source_address = config.dataSources[0].source.address;

  let loadFromDataSource = (dataSource) => {
    const source_address = dataSource.source.address;
    const edefs = dataSource.mapping.eventHandlers.map(
        (eh) => eh.event,
      );
      const source_esigs = edefs.map((ed) =>
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ed)),
      );
      return [source_address, source_esigs];
  }

//   const edefs = config.dataSources[0].mapping.eventHandlers.map(
//     (eh) => eh.event,
//   );
//   const source_esigs = edefs.map((ed) =>
//     ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ed)),
//   );
  const sourceAddressList=[];
  const sourceEsigsList=[];
  config.dataSources.map((ds) => {let [sa, se] = loadFromDataSource(ds); sourceAddressList.push(sa); sourceEsigsList.push(se)})
//   console.log('sourceAddressList', sourceAddressList)
//   console.log('sourceEsigsList', sourceEsigsList)
  return [sourceAddressList, sourceEsigsList];
}
// loadZKGraphConfig('tests/testsrc/zkgraph.yaml')

export function loadZKGraphName(fname) {
  const config = loadYaml(fname);
  return config.name;
}

export function applyZKGraphConfig(configObj) {} //placeholder

export function loadZKGraphDestinations(fname) {
  const config = loadYaml(fname);
  return config.dataDestinations;
  // [
  //   {
  //     kind: 'ethereum/contract',
  //     network: 'mainnet',
  //     destination: { address: '0x123abc' }
  //   }
  // ]
}
