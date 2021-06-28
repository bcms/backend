import type { ControllerMethodPreRequestHandler } from '@becomes/purple-cheetah/types';
import type { BCMSApiKey } from '../../types';

export interface BCMSApiKeyRequestObject<T> {
  data: ApiKeySecurityObject;
  payload: T;
  requestMethod: string;
  path: string;
}

export interface BCMSApiKeySecurity {}

export interface BCMSApiKeySecurityPreRequestHandler {
  (): ControllerMethodPreRequestHandler<BCMSApiKey>;
}
