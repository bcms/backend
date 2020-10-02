import * as crypto from 'crypto';
import { StringUtility } from '@becomes/purple-cheetah';
import { CacheControl } from '../cache';
import { ApiKey, FSApiKey } from './models';
import { Request } from 'express';

export interface ApiKeySecurityObject {
  key: string;
  timestamp: number | string;
  nonce: string;
  signature: string;
}

export interface ApiKeyRequestObject {
  data: ApiKeySecurityObject;
  payload: any;
  requestMethod: string;
  path: string;
}

export class ApiKeySecurity {
  /** Method for creating request signature object. */
  static sign(config: {
    key: {
      id: string;
      secret: string;
    };
    payload: any;
  }): ApiKeySecurityObject {
    const data: ApiKeySecurityObject = {
      key: config.key.id,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex').substring(0, 6),
      signature: '',
    };
    let payloadAsString: string = '';
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
  static requestToApiKeyRequest(request: Request): ApiKeyRequestObject {
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
  static async verifyRequest(request: Request, skipAccess?: boolean) {
    return await this.verify(this.requestToApiKeyRequest(request), skipAccess);
  }
  /** Method used for verifying a request signature object. */
  static async verify(
    request: ApiKeyRequestObject,
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
    let payloadAsString: string = '';
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
      return;
    }
    if (
      ApiKeySecurity.verifyAccess(
        key,
        request.requestMethod as any,
        request.path,
      ) === false
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
    if (path.startsWith('/api/media') && method === 'get') {
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
