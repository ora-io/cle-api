// import yaml from "js-yaml";
// import fs from "fs";
// import semver from "semver";
// import { ethers } from "ethers";

// TODO: remove this, hint: currently only used in this & test
// export function loadYaml(fname) {
//   try {
//     // Read the YAML file contents
//     const fileContents = fs.readFileSync(fname, "utf8");
//     // Parse the YAML content
//     return yaml.load(fileContents);
//   } catch (error) {
//     console.error(error);
//   }
// }

// TODO: remove this, hint: currently only used in this file
// export function loadYamlContent(fileContent) {
//   try {
//     // Parse the YAML content
//     return yaml.load(fileContent);
//   } catch (error) {
//     console.error(error);
//   }
// }

// export function loadZKGraphEventSources(yamlContent) {
//   const config = loadYamlContent(yamlContent);
//   yamlhealthCheck(config);

//   if (!config.dataSources[0].event) {
//     throw new Error("not event zkgraph");
//   }

//   let loadFromEventSource = (event) => {
//     const source_address = event.address;
//       const source_esigs = event.events.map((ed) => {
//         const eventHash = ed.startsWith("0x") ? ed : ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ed));
//         return eventHash;
//       });

//       return [source_address, source_esigs];
//   }

//   const eventDSAddrList=[];
//   const eventDSEsigsList=[];
//   config.dataSources[0].event.map((event) => {let [sa, se] = loadFromEventSource(event); eventDSAddrList.push(sa); eventDSEsigsList.push(se)})
//   return [eventDSAddrList, eventDSEsigsList];
// }

// export function loadZKGraphStorageSources(yamlContent) {
//   const config = loadYamlContent(yamlContent);
//   // yamlhealthCheck(config);

//   if (!config.dataSources[0].storage) {
//     throw new Error("not storage zkgraph");
//   }

//   let loadFromStorageSource = (storage) => {
//     const source_address = storage.address;
//       const source_slots = storage.slots.map((sl) => {
//         return ethers.utils.hexZeroPad(sl, 32);;
//       });

//       return [source_address, source_slots];
//   }

//   const stateDSAddrList=[];
//   const stateDSSlotsList=[];
//   config.dataSources[0].storage.map((storage) => {let [sa, sl] = loadFromStorageSource(storage); stateDSAddrList.push(sa); stateDSSlotsList.push(sl)})
//   return [stateDSAddrList, stateDSSlotsList];
// }

// export function loadZKGraphName(fname) {
//   const config = loadYaml(fname);
//   return config.name;
// }

// export function loadZKGraphType(fileContent) {
//   const config = loadYamlContent(fileContent);
//   if (config.dataSources[0].event) {
//     return "event";
//   };

//   return "storage";
// }

// export function loadZKGraphDestinations(fileContent) {
//   const config = loadYamlContent(fileContent);
//   return config.dataDestinations;

// }

// export function loadZKGraphNetworks(fileContent) {
//   const sourceNetworks = [];
//   const destinationNetworks = [];
//   const config = loadYamlContent(fileContent);

//   // Load network from dataSources
//   config.dataSources.forEach((dataSource) => {
//     sourceNetworks.push(dataSource.network);
//   });

//   // Load network from dataDestinations
//   if (config.dataDestinations) {
//     destinationNetworks.push(config.dataDestinations[0].network);
//   }

//   // If sourceNetworks has multiple networks, throw error
//   if (new Set(sourceNetworks).size > 1) {
//     throw new Error("Different networks in dataSources is not supported.");
//   }

//   // If destinationNetworks has multiple networks, throw error
//   if (new Set(destinationNetworks).size > 1) {
//     throw new Error("Different networks in dataDestinations is not supported.");
//   }

//   // If destinationNetworks is not empty, use destinationNetworks' network
//   if (destinationNetworks.length !== 0) {
//     return destinationNetworks[0];
//   } else {
//     // If destinationNetworks is empty, use sourceNetworks' network
//     return sourceNetworks[0];
//   }
// }
