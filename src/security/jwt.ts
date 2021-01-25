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
import { UserCustomPool, UserPolicy } from '../user';
import { ResponseCode } from '../response-code';

export class JWTSecurity {
  private static logger = new Logger('JWTSecurityPreRequestHandler');

  static preRequestHandler(
    roles: RoleName[],
    permission: PermissionName,
  ): ControllerMethodPreRequestHandler<JWT<UserCustomPool>> {
    return async (request) => {
      return this.verificationWrapper(request, roles, permission);
    };
  }
  static verificationWrapper(
    request: Request,
    roles: RoleName[],
    permission: PermissionName,
  ): JWT<UserCustomPool> {
    const error = HttpErrorFactory.instance(request.originalUrl, this.logger);
    const jwt = JWTSecurityPurpleCheetah.checkAndValidateAndGet<UserCustomPool>(
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
    // if (
    //   jwt.payload.roles[0].name !== RoleName.ADMIN &&
    //   !this.policyCheck(
    //     request.originalUrl,
    //     request.method.toLowerCase(),
    //     jwt.payload.customPool.policy,
    //   )
    // ) {
    //   throw error.occurred(
    //     HttpStatus.FORBIDDEN,
    //     ResponseCode.get('a006', { path: request.originalUrl }),
    //   );
    // }
    return jwt;
  }
  // static policyCheck(
  //   path: string,
  //   method: string,
  //   policy: UserPolicy,
  // ): boolean {
  //   const pathParts = path.split('/').slice(2);
  //   if (pathParts[0] === 'template') {
  //   }
  //   return false;
  // }
}
