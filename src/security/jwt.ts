import {
  ControllerMethodPreRequestHandler,
  HttpErrorFactory,
  HttpStatus,
  JWT,
  JWTConfigService,
  JWTSecurity as JWTSecurityPurpleCheetah,
  Logger,
  PermissionName,
  RoleName,
} from '@becomes/purple-cheetah';
import { Request } from 'express';
import { ResponseCode } from '../response-code';

export class JWTSecurity {
  private static logger = new Logger('JWTSecurityPreRequestHandler');

  static preRequestHandler(
    roles: RoleName[],
    permission: PermissionName,
  ): ControllerMethodPreRequestHandler<JWT> {
    return async (request) => {
      return this.verificationWrapper(request, roles, permission);
    };
  }
  static verificationWrapper(
    request: Request,
    roles: RoleName[],
    permission: PermissionName,
  ): JWT {
    const error = HttpErrorFactory.instance(request.originalUrl, this.logger);
    const jwt = JWTSecurityPurpleCheetah.checkAndValidateAndGet(
      request.headers.authorization,
      {
        roles,
        permission,
        JWTConfig: JWTConfigService.get('user-token-config'),
      },
    );
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    return jwt;
  }
}
