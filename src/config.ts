import { ResponseCode } from "./response-code";

export class Config {
  public static async init() {
    await ResponseCode.init();
  }
}
