import { ConfigFile } from '../config';

export class ShimService {
  static async getConfig(): Promise<ConfigFile> {
    // TODO: send a request to the BCMSShim
    return {
      port: 1280,
      security: {
        jwt: {
          expireIn: 120000,
          issuer: 'localhost',
          secret: 'secret',
        },
      },
      database: {
        fs: 'bcms',
      },
      plugins: [],
    };
  }
}
