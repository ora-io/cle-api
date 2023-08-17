
class EndPoint {
  constructor(url, isProtected, contentType) {
    this.url = url; //: string;
    this.isProtected = isProtected; //: boolean;
    this.contentType = contentType; //?: {};}
  }
}

export default {
  postNewWasmImage: (zkwasmProverUrl) =>
    new EndPoint(`${zkwasmProverUrl}/setup`, false),
  fetchConfiguredMD5: (zkwasmProverUrl) =>
    new EndPoint(`${zkwasmProverUrl}/tasks?tasktype=Setup`, false),
  checkWasmImageStatus: (zkwasmProverUrl, md5, taskType = null) =>
    new EndPoint(
      `${zkwasmProverUrl}/tasks?md5=${md5}${
        taskType ? "&tasktype=" + taskType : ""
      }`,
      false,
    ),
  deployWasmImageURL: (zkwasmProverUrl) =>
    new EndPoint(`${zkwasmProverUrl}/deploy`, false, {
      "Content-Type": "application/json",
    }),
  proveWasmImageURL: (zkwasmProverUrl) =>
    new EndPoint(`${zkwasmProverUrl}/prove`, false, {
      "Content-Type": "application/json",
    }),
  getTaskDetails: (zkwasmProverUrl, taskId) =>
    new EndPoint(`${zkwasmProverUrl}/tasks?id=${taskId}`, false, {
      "Content-Type": "application/json",
    }),
  searchImageURL: (zkwasmProverUrl, md5) =>
    new EndPoint(`${zkwasmProverUrl}/image?md5=${md5}`, false),
  getUserBalance: (zkwasmProverUrl, address) =>
    new EndPoint(
      `${zkwasmProverUrl}/user?user_address=${address}`,
      false,
    ),
  sendTXHash: (zkwasmProverUrl, address) =>
    new EndPoint(`${zkwasmProverUrl}/pay`, false, {
      "Content-Type": "application/json",
    }),
  uploadToPinata: () =>
    new EndPoint(`${config.PinataEndpoint}`, true)
};
