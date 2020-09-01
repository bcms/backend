import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  HttpErrorFactory,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  HttpStatus,
  Post,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { FunctionManager } from './manager';
import { ResponseCode } from '../response-code';
import { ApiKeySecurity } from '../api';

@Controller('/api/function')
export class FunctionController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get('/available')
  async getAvailable(
    request: Request,
  ): Promise<{
    functions: Array<{
      name: string;
      public: boolean;
    }>;
  }> {
    const error = HttpErrorFactory.instance('getAvailable', this.logger);
    const authorization = request.headers.authorization;
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
      permission: PermissionName.READ,
      JWTConfig: JWTConfigService.get('user-token-config'),
    });
    if (jwt instanceof Error) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    return {
      functions: FunctionManager.fns.map((e) => {
        return {
          name: e.config.name,
          public: e.config.public,
        };
      }),
    };
  }

  @Post('/:name')
  async execute(
    request: Request,
  ): Promise<{
    success: boolean;
    err?: any;
    result?: any;
  }> {
    const error = HttpErrorFactory.instance('execute', this.logger);
    const authorization = request.headers.authorization;
    const apiRequest = request.query.signature
      ? ApiKeySecurity.requestToApiKeyRequest(request)
      : undefined;
    const fn = FunctionManager.fns.find(
      (e) => e.config.name === request.params.name,
    );
    let pub = false;
    if (fn) {
      pub = fn.config.public;
    }
    if (pub === false) {
      if (apiRequest) {
        try {
          ApiKeySecurity.verify(apiRequest);
        } catch (e) {
          throw error.occurred(
            HttpStatus.UNAUTHORIZED,
            ResponseCode.get('ak007', { msg: e.message }),
          );
        }
      } else {
        const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
          roles: [RoleName.ADMIN, RoleName.USER],
          permission: PermissionName.READ,
          JWTConfig: JWTConfigService.get('user-token-config'),
        });
        if (jwt instanceof Error) {
          throw error.occurred(
            HttpStatus.UNAUTHORIZED,
            ResponseCode.get('g001', {
              msg: jwt.message,
            }),
          );
        }
      }
    }
    if (!fn) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Function with name "${request.params.name}" does not exist.`,
      );
    }
    let result: any;
    try {
      result = await fn.handler(request);
    } catch (e) {
      this.logger.error('execute', e);
      throw error.occurred(HttpStatus.INTERNAL_SERVER_ERROR, {
        success: false,
        err: e.message,
      });
    }
    return {
      success: true,
      result,
    };
  }
}
