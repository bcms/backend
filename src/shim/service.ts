import * as crypto from 'crypto';
import type { BCMSShimService as BCMSShimServiceType } from '../types';
import {
  Module,
  HTTPStatus,
  HTTPError,
  HttpClientResponseError,
  Logger,
} from '@becomes/purple-cheetah/types';
import { createHttpClient, useFS, useLogger } from '@becomes/purple-cheetah';

let logger: Logger;
const http = createHttpClient({
  name: 'shimClient',
  host: { name: '172.17.0.1', port: '1282' },
  basePath: '/shim',
});
let code = '';
let connected = false;
let validTo = 0;

export const BCMSShimService: BCMSShimServiceType = {
  getCode() {
    return code;
  },
  isConnected() {
    return connected;
  },
  refreshAvailable() {
    if (!connected) {
      connected = true;
      logger.info('refreshAvailable', 'Connected to the SHIM.');
    }
    validTo = Date.now() + 10000;
  },
  async send<Return, Payload>(data: {
    uri: string;
    payload: Payload;
    errorHandler?: HTTPError;
  }): Promise<Return> {
    if (!connected && process.env.BCMS_LOCAL !== 'true') {
      if (data.errorHandler) {
        throw data.errorHandler.occurred(
          HTTPStatus.FORBIDDEN,
          'Instance in not connected.',
        );
      }
      throw Error('Instance is not connected.');
    }
    const nonce = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    const response = await http.send<Return, Payload, unknown>({
      path: data.uri,
      method: 'post',
      data: data.payload,
      headers: {
        'bcms-iid': '' + process.env.BCMS_INSTANCE_ID,
        'bcms-nc': nonce,
        'bcms-ts': '' + timestamp,
        'bcms-sig': crypto
          .createHmac('sha256', BCMSShimService.getCode())
          .update(nonce + timestamp + JSON.stringify(data.payload))
          .digest('hex'),
      },
    });
    if (response instanceof HttpClientResponseError) {
      logger.error('send', response);
      if (data.errorHandler) {
        throw data.errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to send a request.',
        );
      }
      throw Error('Failed to send a request.');
    }
    return response.data;
  },
};

export function createBcmsShimService(): Module {
  return {
    name: 'Shim service',
    initialize({next}) {
      logger = useLogger({ name: 'Shim service' });
      const fs = useFS();
      fs.read('shim.json')
        .then((file) => {
          try {
            const shimJson = JSON.parse(file.toString());
            code = shimJson.code;
          } catch (err) {
            next(err as Error);
            return;
          }
          setInterval(() => {
            if (connected && validTo < Date.now()) {
              connected = false;
              logger.warn('', 'Lost connection to the SHIM.');
            }
          }, 1000);
          next();
        })
        .catch((err) => {
          next(err);
        });
    },
  };
}
