import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as crypto from 'crypto';
import { Http } from '../util';
import { HttpError, HttpStatus, Logger } from '@becomes/purple-cheetah';

let connected = false;
let validTo = 0;
setInterval(() => {
  if (connected && validTo < Date.now()) {
    connected = false;
    console.log('Lost connection to the SHIM.');
  }
}, 1000);

export class ShimService {
  private static readonly logger = new Logger('ShimService');
  private static http = process.env.PROD
    ? new Http('172.17.0.1', '2070')
    : new Http('localhost', '2070');
  private static code = '';
  static async init() {
    const shimJson: {
      code: string;
    } = JSON.parse(
      (
        await util.promisify(fs.readFile)(path.join(process.cwd(), 'shim.json'))
      ).toString(),
    );
    this.code = shimJson.code;
  }
  static isConnected(): boolean {
    return connected;
  }
  static getCode(): string {
    return '' + this.code;
  }
  static refreshAvailable() {
    if (!connected) {
      connected = true;
      console.log('Connected to the SHIM.');
    }
    validTo = Date.now() + 5000;
  }
  static async send<T>(
    uri: string,
    payload: unknown,
    error?: HttpError,
  ): Promise<T> {
    if (!connected && process.env.BCMS_LOCAL !== 'true') {
      if (error) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          'Instance in not connected.',
        );
      }
      throw Error('Instance is not connected.');
    }
    try {
      const nonce = crypto.randomBytes(8).toString('hex');
      const timestamp = Date.now();
      const response = await this.http.send<T>({
        path: uri,
        method: 'POST',
        data: payload,
        headers: {
          'bcms-iid': process.env.BCMS_INSTANCE_ID,
          'bcms-nc': nonce,
          'bcms-ts': '' + timestamp,
          'bcms-sig': crypto
            .createHmac('sha256', ShimService.getCode())
            .update(nonce + timestamp + JSON.stringify(payload))
            .digest('hex'),
        },
      });
      return response.data;
    } catch (e) {
      console.error(e);
      // this.logger.error('send', e);
      if (error) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to send a request.',
        );
      }
      throw Error('Failed to send a request.');
    }
  }
}
