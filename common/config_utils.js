import yaml from "js-yaml";
import fs from "fs";
import semver from "semver";
import { ethers } from "ethers";

export function loadYaml(fname) {
  try {
    // Read the YAML file contents
    const fileContents = fs.readFileSync(fname, "utf8");
    // Parse the YAML content
    return yaml.load(fileContents);
  } catch (error) {
    console.error(error);
  }
}

export function loadYamlContent(fileContent) {
  try {
    // Parse the YAML content
    return yaml.load(fileContent);
  } catch (error) {
    console.error(error);
  }
}

export function yamlhealthCheck(config) {
  // specVersion check

  if (!config.specVersion || typeof config.specVersion !== 'string' || config.specVersion.trim() === '') {
    throw new Error("specVersion is missing or empty");
  }

  if (semver.gt(config.specVersion, '0.0.2')) {
    throw new Error("Invalid specVersion, it should be <= 0.0.2");
  }

  // apiVersion → zkgraph-lib version check
  if (!config.apiVersion || typeof config.apiVersion !== 'string' || config.apiVersion.trim() === '') {
    throw new Error("apiVersion is missing or empty");
  }

  if (semver.gt(config.apiVersion, '0.0.2')) {
    throw new Error("Invalid apiVersion, it should be <= 0.0.2");
  }

  // datasources can have multiple objects, but should not be empty
  if (!config.dataSources || config.dataSources.length === 0) {
    throw new Error("dataSources should not be empty");
  }

  const sourceNetworks = [];

  config.dataSources.forEach(dataSource => {
    // every object in datasources MUST have network, block
    if (!dataSource.kind || !dataSource.network || !dataSource.block) {
      throw new Error("dataSource object is missing required fields");
    }

    sourceNetworks.push(dataSource.network);

    const eventCount = dataSource.event ? 1 : 0;
    const storageCount = dataSource.storage ? 1 : 0;

    if (eventCount + storageCount !== 1) {
      throw new Error("must have one and only one 'event' or 'storage' field");
    }
  });

  // every network field must be the same
  if (new Set(sourceNetworks).size !== 1) {
    throw new Error("All dataSource networks must be the same");
  }

  // all mapping fields must be not empty
  if (!config.mapping.language || !config.mapping.file || !config.mapping.handler) {
    throw new Error("Some required fields are empty in mapping");
  }

  // data destination must have network and destination
  if (config.dataDestinations) {
    if (!config.dataDestinations[0].network || !config.dataDestinations[0].address) {
      throw new Error("dataDestinations object is missing required fields");
    }

    // address must be the ethereum address and not address zero
    if (!isEthereumAddress(config.dataDestinations[0].address)) {
      throw new Error("Invalid Ethereum address in dataDestinations");
    }
  }

  // 12. the network must be same as the source network
  // TODO: right now we don't check the block hash, so skip the same network check
  // if (config.dataDestinations[0].network !== sourceNetworks[0]) {
  //   throw new Error("dataDestinations network must match dataSources network");
  // }
}

export function isEthereumAddress(address) {
  try {
    const parsedAddress = ethers.utils.getAddress(address);
    return parsedAddress !== '0x0000000000000000000000000000000000000000';
  } catch (error) {
    return false;
  }
}


export function loadZKGraphEventSources(yamlContent) {
  const config = loadYamlContent(yamlContent);
  yamlhealthCheck(config);

  if (!config.dataSources[0].event) {
    throw new Error("not event zkgraph");
  }

  let loadFromEventSource = (event) => {
    const source_address = event.address;
      const source_esigs = event.events.map((ed) => {
        const eventHash = ed.startsWith("0x") ? ed : ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ed));
        return eventHash;
      });

      return [source_address, source_esigs];
  }

  const sourceAddressList=[];
  const sourceEsigsList=[];
  config.dataSources[0].event.map((event) => {let [sa, se] = loadFromEventSource(event); sourceAddressList.push(sa); sourceEsigsList.push(se)})
  return [sourceAddressList, sourceEsigsList];
}

export function loadZKGraphName(fname) {
  const config = loadYaml(fname);
  return config.name;
}


export function loadZKGraphDestinations(fileContent) {
  const config = loadYamlContent(fileContent);
  return config.dataDestinations;

}

export function loadZKGraphNetworks(fileContent) {
  const sourceNetworks = [];
  const destinationNetworks = [];
  const config = loadYamlContent(fileContent);

  // Load network from dataSources
  config.dataSources.forEach((dataSource) => {
    sourceNetworks.push(dataSource.network);
  });

  // Load network from dataDestinations
  if (config.dataDestinations) {
    destinationNetworks.push(config.dataDestinations[0].network);
  }

  // If sourceNetworks has multiple networks, throw error
  if (new Set(sourceNetworks).size > 1) {
    throw new Error("Different networks in dataSources is not supported.");
  }

  // If destinationNetworks has multiple networks, throw error
  if (new Set(destinationNetworks).size > 1) {
    throw new Error("Different networks in dataDestinations is not supported.");
  }

  // If destinationNetworks is not empty, use destinationNetworks' network
  if (destinationNetworks.length !== 0) {
    return destinationNetworks[0];
  } else {
    // If destinationNetworks is empty, use sourceNetworks' network
    return sourceNetworks[0];
  }
}
