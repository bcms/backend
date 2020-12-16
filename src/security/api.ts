import * as crypto from 'crypto';
import {
  ControllerMethodPreRequestHandler,
  HttpErrorFactory,
  HttpStatus,
  Logger,
  StringUtility,
} from '@becomes/purple-cheetah';
import { ResponseCode } from '../response-code';
import { ApiKey, FSApiKey } from '../api';
import { Request } from 'express';
import { CacheControl } from '../cache';

export interface ApiKeySecurityObject {
  key: string;
  timestamp: number | string;
  nonce: string;
  signature: string;
}

export interface ApiKeyRequestObject<T> {
  data: ApiKeySecurityObject;
  payload: T;
  requestMethod: string;
  path: string;
}

export class ApiKeySecurity {
  private static logger = new Logger('ApiSecurityPreRequestHandler');

  static preRequestHandler(): ControllerMethodPreRequestHandler<
    ApiKey | FSApiKey
  > {
    return async (request) => {
      return await this.verificationWrapper(request);
    };
  }
  static async verificationWrapper(request: Request) {
    const error = HttpErrorFactory.instance(request.originalUrl, this.logger);
    try {
      return await ApiKeySecurity.verify(
        ApiKeySecurity.requestToApiKeyRequest(request),
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('ak007', { msg: e.message }),
      );
    }
  }
  /** Method for creating request signature object. */
  static sign<T>(config: {
    key: {
      id: string;
      secret: string;
    };
    payload: T;
  }): ApiKeySecurityObject {
    const data: ApiKeySecurityObject = {
      key: config.key.id,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex').substring(0, 6),
      signature: '',
    };
    let payloadAsString = '';
    if (typeof config.payload === 'object') {
      payloadAsString = Buffer.from(
        encodeURIComponent(JSON.stringify(config.payload)),
      ).toString('base64');
    } else {
      payloadAsString = '' + config.payload;
    }
    const hmac = crypto.createHmac('sha256', config.key.secret);
    hmac.update(data.nonce + data.timestamp + data.key + payloadAsString);
    data.signature = hmac.digest('hex');
    return data;
  }
  static requestToApiKeyRequest<T>(request: Request): ApiKeyRequestObject<T> {
    return {
      data: {
        key: '' + request.query.key,
        nonce: '' + request.query.nonce,
        signature: '' + request.query.signature,
        timestamp: '' + request.query.timestamp,
      },
      payload: request.body,
      requestMethod: request.method.toUpperCase(),
      path: request.originalUrl,
    };
  }
  static async verifyRequest(
    request: Request,
    skipAccess?: boolean,
  ): Promise<ApiKey | FSApiKey> {
    return await this.verify(this.requestToApiKeyRequest(request), skipAccess);
  }
  /** Method used for verifying a request signature object. */
  static async verify<T>(
    request: ApiKeyRequestObject<T>,
    skipAccess?: boolean,
  ): Promise<ApiKey | FSApiKey> {
    request.path = request.path.split('?')[0];
    if (typeof request.data.key === 'undefined') {
      throw new Error(`Missing property 'key'.`);
    }
    if (typeof request.data.nonce === 'undefined') {
      throw new Error(`Missing property 'nonce'.`);
    }
    if (typeof request.data.timestamp === 'undefined') {
      throw new Error(`Missing property 'timestamp'.`);
    } else {
      if (typeof request.data.timestamp === 'string') {
        request.data.timestamp = parseInt(request.data.timestamp, 10);
      }
    }
    if (typeof request.data.signature === 'undefined') {
      throw new Error(`Missing property 'signature'.`);
    }
    if (StringUtility.isIdValid(request.data.key) === false) {
      throw new Error(`Invalid 'key' value was provided.`);
    }
    const key = await CacheControl.apiKey.findById(request.data.key);
    if (!key) {
      throw new Error(`Invalid 'key' was provided.`);
    }
    if (key.blocked === true) {
      throw new Error('This Key is blocked.');
    }
    let payloadAsString = '';
    if (typeof request.payload === 'object') {
      payloadAsString = Buffer.from(
        encodeURIComponent(JSON.stringify(request.payload)),
      ).toString('base64');
    } else {
      payloadAsString = '' + request.payload;
    }
    if (
      request.data.timestamp < Date.now() - 60000 ||
      request.data.timestamp > Date.now() + 3000
    ) {
      throw new Error('Timestamp out of range.');
    }
    const hmac = crypto.createHmac('sha256', key.secret);
    hmac.update(
      request.data.nonce +
        request.data.timestamp +
        request.data.key +
        payloadAsString,
    );
    const signature = hmac.digest('hex');
    if (signature !== request.data.signature) {
      throw new Error('Invalid signature.');
    }
    if (skipAccess && skipAccess === true) {
      return key;
    }
    if (
      ApiKeySecurity.verifyAccess(key, request.requestMethod, request.path) ===
      false
    ) {
      throw Error(`Key is not allowed to access this resource.`);
    }
    return key;
  }

  static verifyAccess(
    key: ApiKey | FSApiKey,
    method: string,
    path: string,
  ): boolean {
    method = method.toLowerCase();
    if (path.startsWith('/api/key/access/list')) {
      return true;
    } else if (path.startsWith('/api/media') && method === 'get') {
      return true;
    } else if (path.startsWith('/api/function')) {
      const p = path.replace('/api/function/', '');
      if (key.access.functions.find((e) => e.name === p) && method === 'post') {
        return true;
      }
    } else if (path.startsWith('/api/template')) {
      const params = path.split('/').slice(3);
      switch (method) {
        case 'get': {
          // GET: /:templateId
          const templateId = params[0];
          const accessPolicy = key.access.templates.find(
            (e) => e._id === templateId,
          );
          if (accessPolicy) {
            return true;
          }
        }
      }
    } else if (path.startsWith('/api/entry')) {
      const parts = path.split('/');
      if (parts.length > 2) {
        const params = parts.slice(3);
        switch (method) {
          case 'get':
            {
              if (params.length > 1) {
                if (params[0] === 'all') {
                  // GET: /all/:templateId
                  // GET: /all/:templateId/lite
                  const templateId = params[1];
                  const accessPolicy = key.access.templates.find(
                    (e) => e._id === templateId,
                  );
                  if (
                    accessPolicy &&
                    accessPolicy[method.toLowerCase()] === true
                  ) {
                    return true;
                  }
                } else if (params[0] === 'count') {
                  // GET: /count/:templateId
                  const templateId = params[1];
                  const accessPolicy = key.access.templates.find(
                    (e) => e._id === templateId,
                  );
                  if (
                    accessPolicy &&
                    accessPolicy[method.toLowerCase()] === true
                  ) {
                    return true;
                  }
                } else {
                  // GET: /:templateId/:entryId
                  const templateId = params[0];
                  const accessPolicy = key.access.templates.find(
                    (e) => e._id === templateId,
                  );
                  if (
                    accessPolicy &&
                    accessPolicy[method.toLowerCase()] === true
                  ) {
                    return true;
                  }
                }
              }
            }
            break;
          case 'post':
            {
              if (params.length === 1) {
                // POST: /:templateId/
                const templateId = params[0];
                const accessPolicy = key.access.templates.find(
                  (e) => e._id === templateId,
                );
                if (
                  accessPolicy &&
                  accessPolicy[method.toLowerCase()] === true
                ) {
                  return true;
                }
              }
            }
            break;
          case 'put':
            {
              if (params.length === 1) {
                // PUT: /:templateId/
                const templateId = params[0];
                const accessPolicy = key.access.templates.find(
                  (e) => e._id === templateId,
                );
                if (
                  accessPolicy &&
                  accessPolicy[method.toLowerCase()] === true
                ) {
                  return true;
                }
              }
            }
            break;
          case 'delete':
            {
              if (params.length === 2) {
                // POST: /:templateId/:entryId
                const templateId = params[0];
                const accessPolicy = key.access.templates.find(
                  (e) => e._id === templateId,
                );
                if (
                  accessPolicy &&
                  accessPolicy[method.toLowerCase()] === true
                ) {
                  return true;
                }
              }
            }
            break;
        }
      }
    }
    return false;
  }
}
