class EndPoint {
  url: string
  isProtected: boolean
  contentType: Record<string, any> = {}
  constructor(url: string, isProtected: boolean, contentType: Record<string, any> = {}) {
    this.url = url // : string;
    this.isProtected = isProtected // : boolean;
    this.contentType = contentType // ?: {};}
  }
}

export default {
  postNewWasmImage: (zkwasmProverUrl: string) =>
    new EndPoint(`${zkwasmProverUrl}/setup`, false),
  fetchConfiguredMD5: (zkwasmProverUrl: string) =>
    new EndPoint(`${zkwasmProverUrl}/tasks?tasktype=Setup`, false),
  checkWasmImageStatus: (zkwasmProverUrl: string, md5: string, taskType: string | null = null) =>
    new EndPoint(
      `${zkwasmProverUrl}/tasks?md5=${md5}${
        taskType ? `&tasktype=${taskType}` : ''
      }`,
      false,
    ),
  deployWasmImageURL: (zkwasmProverUrl: string) =>
    new EndPoint(`${zkwasmProverUrl}/deploy`, false, {
      'Content-Type': 'application/json',
    }),
  proveWasmImageURL: (zkwasmProverUrl: string) =>
    new EndPoint(`${zkwasmProverUrl}/prove`, false, {
      'Content-Type': 'application/json',
    }),
  getTaskDetails: (zkwasmProverUrl: string, taskId?: string) =>
    new EndPoint(`${zkwasmProverUrl}/tasks?id=${taskId}`, false, {
      'Content-Type': 'application/json',
    }),
  searchImageURL: (zkwasmProverUrl: string, md5: string) =>
    new EndPoint(`${zkwasmProverUrl}/image?md5=${md5}`, false),
  getUserBalance: (zkwasmProverUrl: string, address: string) =>
    new EndPoint(
      `${zkwasmProverUrl}/user?user_address=${address}`,
      false,
    ),
  sendTXHash: (zkwasmProverUrl: string, _address: string) =>
    new EndPoint(`${zkwasmProverUrl}/pay`, false, {
      'Content-Type': 'application/json',
    }),
  uploadToPinata: (pinataEndpoint: any) =>
    new EndPoint(`${pinataEndpoint}`, true),
}
