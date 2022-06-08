import type { Request } from 'express';
import type { BCMSApiKey } from '../api';

export interface BCMSApiKeySecurity {
  verify<Payload>(
    request: BCMSApiKeyRequestObject<Payload>,
    skipAccess?: boolean,
  ): Promise<BCMSApiKey>;
  verifyAccess(key: BCMSApiKey, method: string, path: string): boolean;
  sign(config: {key: {id: string, secret: string}, payload: unknown}): BCMSApiKeySignature;
  httpRequestToApiKeyRequest<Payload>(request: Request): BCMSApiKeyRequestObject<Payload>;
}

export interface BCMSApiKeySignature {
  /** Key */
  k: string;
  /** Timestamp */
  t: number | string;
  /** Nonce */
  n: string;
  /** Signature */
  s: string;
}

export interface BCMSApiKeyRequestObject<Payload> {
  data: BCMSApiKeySignature;
  payload: Payload;
  requestMethod: string;
  path: string;
}
