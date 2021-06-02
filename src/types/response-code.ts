export interface ResponseCode {
  register(codes: Array<{ name: string; msg: string }>): void;
  get(
    code: string,
    vars?: { [key: string]: string },
  ): { code: string; message: string };
}
export interface ResponseCodeList {
  [key: string]: {
    msg: string;
  };
}
