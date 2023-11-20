import BN from "bn.js";
import { networks } from "./constants.js";

export function fromHexString(hexString) {
  hexString = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  hexString = hexString.length % 2 ? "0" + hexString : hexString;
  return Uint8Array.from(Buffer.from(hexString, "hex"));
}

export function toHexString(bytes) {
  return Buffer.from(bytes).toString("hex");
}

export function toHexStringBytes32Reverse(arr) {
  let result = "";
  for (let i = 0; i < arr.length / 32; i++) {
    result +=
      "0x" + toHexString(arr.slice(i * 32, (i + 1) * 32).reverse()) + "\n";
  }
  return result;
}

export function areEqualArrays(first, second) {
  return (
    first.length === second.length &&
    first.every((value, index) => value === second[index])
  );
}

export function trimPrefix(str, prefix) {
  if (str.startsWith(prefix)) {
    str = str.substring(prefix.length);
  }
  return str;
}

export function concatHexStrings(hexStrings) {
  let result = "";
  for (let hexString of hexStrings) {
    result += hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  }
  return "0x" + result;
}

function hexToBNs(hexString){
    let bytes = new Array(Math.ceil(hexString.length/16));
    for (var i = 0; i < hexString.length; i += 16) {
      bytes[i] = new BN(hexString.slice(i, Math.min(i+16, hexString.length)), 16, 'le');
    }
    return bytes;
  }

function parseArg(input) {
    let inputArray = input.split(":");
    let value = inputArray[0];
    let type = inputArray[1];
    let re1 = new RegExp(/^[0-9A-Fa-f]+$/); // hexdecimal
    let re2 = new RegExp(/^\d+$/); // decimal

    // Check if value is a number
    if(!(re1.test(value.slice(2)) || re2.test(value))) {
      console.log("Error: input value is not an interger number");
      return null;
    }

    // Convert value byte array
    if(type == "i64") {
      let v;
      if(value.slice(0, 2) == "0x") {
        v = new BN(value.slice(2), 16);
      } else {
        v = new BN(value);
      }
      return [v];
    } else if(type == "bytes" || type == "bytes-packed") {
      if(value.slice(0, 2) != "0x") {
        console.log("Error: bytes input need start with 0x");
        return null;
      }
      let bytes = hexToBNs(value.slice(2));
      return bytes;
    } else {
      console.log("Unsupported input data type: %s", type);
      return null;
    }
  }

// https://github.com/zkcrossteam/g1024/blob/916c489fefa65ce8d4ee1a387f2bd4a3dcca8337/src/data/image.ts#L95
export function parseArgs(raw) {
  let parsedInputs = new Array();
  for (var input of raw) {
    input = input.trim();
    if (input !== "") {
      let args = parseArg(input);
      if (args != null) {
        parsedInputs.push(args);
      } else {
        throw Error(`invalid args in ${input}`);
      }
    }
  }
  return parsedInputs.flat();
}

export function getTargetNetwork(inputtedNetworkName) {
  const validNetworkNames = networks.map((net) => net.name.toLowerCase());
  if (!validNetworkNames.includes(inputtedNetworkName.toLowerCase())) {
    // console.log(`[-] NETWORK NAME "${inputtedNetworkName}" IS INVALID.`, "\n");
    // console.log(`[*] Valid networks: ${validNetworkNames.join(", ")}.`, "\n");
    // logDivider();
    // process.exit(1);
    return;
  }
  const targetNetwork = networks.find(
    (net) => net.name.toLowerCase() === inputtedNetworkName.toLowerCase()
  );
  return targetNetwork;
}

export function dspParamsNormalize(params = [], realParams = {}) {
  return params.map((param) => {
    return {
      [param]: realParams[param],
    };
  });
}
