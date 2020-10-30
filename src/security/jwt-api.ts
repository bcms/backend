import {
  ControllerMethodPreRequestHandler,
  JWT,
  PermissionName,
  RoleName,
} from '@becomes/purple-cheetah';
import { ApiKey, FSApiKey } from '../api';
import { ApiKeySecurity } from './api';
import { JWTSecurity } from './jwt';

export interface JWTApiSecurityPreRequestHandlerOutput {
  type: 'jwt' | 'api';
  value: JWT | ApiKey | FSApiKey;
}

export class JWTApiSecurity {
  static preRequestHandler(
    roles: RoleName[],
    permission: PermissionName,
  ): ControllerMethodPreRequestHandler<JWTApiSecurityPreRequestHandlerOutput> {
    return async (request) => {
      if (request.query.signature) {
        return {
          type: 'api',
          value: await ApiKeySecurity.verificationWrapper(request),
        };
      }
      return {
        type: 'jwt',
        value: JWTSecurity.verificationWrapper(request, roles, permission),
      };
    };
  }
}
