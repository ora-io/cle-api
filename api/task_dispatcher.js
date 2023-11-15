import { ethers } from "ethers";
import axios from "axios";

const ABI = [
    'function setup(string memory imageId, uint256 circuitSize) payable',
    'function prove(string memory imageId, string memory privateInput, string memory publicInput) payable',
    'function deploy(string memory imageId, uint256 chainid) payable'
  ];
export class TaskDispatch {
    constructor(queryAPI, contractAddress, feeInWei, provider, signer){
        this.queryAPI = queryAPI;
        this.feeInWei = feeInWei;
        this.dispatcherContract = new ethers.Contract(contractAddress, ABI, provider).connect(signer);
    }

    /**
     * Query task id by txhash.
     */
    async queryTask(txhash) {
        const response = await axios.get(`${this.queryAPI}/task?txhash=${txhash}`);
        return response.data;
    }

    /**
     * Setup wasm iamge.
     * @param {string} imageId
     * @param {number} circuitSize
     * @returns {Promise<ethers.ContractTransaction>}
     */
    async setup(imageId, circuitSize) {
        const tx = await this.dispatcherContract.setup(imageId, circuitSize, {
            value: this.feeInWei,
        });
        return tx;
    }

    /**
     * Prove task.
     * @param {string} imageId
     * @param {string} privateInput
     * @param {string} publicInput
     * @returns {Promise<ethers.ContractTransaction>}
     */
    async prove(imageId, privateInput, publicInput) {
        const tx = await this.dispatcherContract.prove(imageId, privateInput, publicInput, {
            value: this.feeInWei,
        });
        return tx;
    }

    /**
     * Deploy verify contract.
     * @param {string} imageId
     * @param {number} chainid
     * @returns {Promise<ethers.ContractTransaction>}
     */
    async deploy(imageId, chainid) {
        const tx = await this.dispatcherContract.deploy(imageId, chainid, {
            value: this.feeInWei,
        });
        return tx;
    }
}
