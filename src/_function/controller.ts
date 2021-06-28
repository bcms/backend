import {
  ControllerPrototype,
  Logger,
  Controller,
  Get,
  HttpErrorFactory,
  JWTSecurity as JWTSecurityPurpleCheetah,
  RoleName,
  PermissionName,
  JWTConfigService,
  HttpStatus,
  Post,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { FunctionManager } from './manager';
import { ResponseCode } from '../_response-code';
import { ApiKeySecurity, JWTSecurity } from '../_security';

@Controller('/api/function')
export class FunctionController implements ControllerPrototype {
  name: string;
  baseUri: string;
  logger: Logger;
  router: Router;
  initRouter: () => void;

  @Get(
    '/available',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAvailable(): Promise<{
    functions: Array<{
      name: string;
      public: boolean;
    }>;
  }> {
    return {
      functions: FunctionManager.getAll().map((e) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result?: any;
  }> {
    const error = HttpErrorFactory.instance('execute', this.logger);
    const authorization = request.headers.authorization;
    const apiRequest = request.query.signature
      ? ApiKeySecurity.requestToApiKeyRequest(request)
      : undefined;
    const fn = FunctionManager.get(request.params.name);
    if (!fn) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('fn001', { name: request.params.name }),
      );
    }
    let pub = false;
    if (fn) {
      pub = fn.config.public;
    }
    if (pub === false) {
      if (apiRequest) {
        try {
          await ApiKeySecurity.verify(apiRequest);
        } catch (e) {
          throw error.occurred(
            HttpStatus.UNAUTHORIZED,
            ResponseCode.get('ak007', { msg: e.message }),
          );
        }
      } else {
        const jwt = JWTSecurityPurpleCheetah.checkAndValidateAndGet(
          authorization,
          {
            roles: [RoleName.ADMIN, RoleName.USER],
            permission: PermissionName.READ,
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
      }
    }
    if (!fn) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        `Function with name "${request.params.name}" does not exist.`,
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
