export interface BCMSResponseCode {
  register(codes: Array<{ name: string; msg: string }>): void;
  get(
    code: string,
    vars?: { [key: string]: string },
  ): { code: string; message: string };
}
export interface BCMSResponseCodeList {
  [key: string]: {
    msg: string;
  };
}
