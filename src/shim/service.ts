import * as crypto from 'crypto';
import type { BCMSShimService as BCMSShimServiceType } from '../types';
import {
  Module,
  HTTPStatus,
  HTTPError,
  HttpClientResponseError,
  Logger,
  ObjectUtilityError,
  HttpClient,
} from '@becomes/purple-cheetah/types';
import {
  createHttpClient,
  useFS,
  useLogger,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import { ShimConfig } from './config';
import { BCMSConfig } from '@bcms/config';

let logger: Logger;
let http: HttpClient;
let connected = false;
let validTo = 0;

export const BCMSShimService: BCMSShimServiceType = {
  getCode() {
    return ShimConfig.code;
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
    if (!connected && !ShimConfig.local) {
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
        'bcms-iid': '' + ShimConfig.instanceId,
        'bcms-nc': nonce,
        'bcms-ts': '' + timestamp,
        'bcms-sig': crypto
          .createHmac('sha256', BCMSShimService.getCode())
          .update(nonce + timestamp + JSON.stringify(data.payload))
          .digest('hex'),
      },
    });
    if (response instanceof HttpClientResponseError) {
      // logger.error('send', response);
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
    initialize({ next }) {
      logger = useLogger({ name: 'Shim service' });
      http = createHttpClient({
        name: 'shimClient',
        host: { name: '172.17.0.1', port: BCMSConfig.local ? '1279' : '3000' },
        basePath: '/shim',
      });
      const fs = useFS();
      fs.read('shim.json')
        .then((file) => {
          const objectUtil = useObjectUtility();
          try {
            const shimJson = JSON.parse(file.toString());
            const checkObject = objectUtil.compareWithSchema(
              shimJson,
              {
                code: {
                  __type: 'string',
                  __required: false,
                },
                instanceId: {
                  __type: 'string',
                  __required: false,
                },
                local: {
                  __type: 'boolean',
                  __required: false,
                },
              },
              'shim',
            );
            if (checkObject instanceof ObjectUtilityError) {
              next(Error(checkObject.message));
              return;
            }
            ShimConfig.code = shimJson.code || 'local';
            ShimConfig.instanceId = shimJson.instanceId || '';
            ShimConfig.local = shimJson.local || false;
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
