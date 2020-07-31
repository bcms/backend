import {
  ControllerPrototype,
  Controller,
  Logger,
  Post,
} from '@becomes/purple-cheetah';
import { Router, Request } from 'express';
import { AuthRequestHandler } from './request-handler';

@Controller('/api/auth')
export class AuthController implements ControllerPrototype {
  baseUri: string;
  initRouter: any;
  logger: Logger;
  name: string;
  router: Router;

  @Post('/login')
  async login(
    request: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return await AuthRequestHandler.login(request.headers.authorization);
  }

  @Post('/token/refresh')
  async refreshAccess(request: Request): Promise<{ accessToken: string }> {
    return {
      accessToken: await AuthRequestHandler.refreshAccess(
        request.headers.authorization,
      ),
    };
  }

  // TODO: Add logout
}
