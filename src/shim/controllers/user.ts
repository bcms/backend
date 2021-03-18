import {
  Controller,
  ControllerPrototype,
  Get,
  HttpErrorFactory,
  HttpStatus,
  JWTConfigService,
  JWTEncoding,
  Logger,
  PermissionName,
  Post,
  RoleName,
} from '@becomes/purple-cheetah';
import { Request, Router } from 'express';
import { JWTSecurity } from '../../security';
import { InstanceUser } from '../types';
import { ShimService } from '../service';
import { ResponseCode } from '../../response-code';

@Controller('/api/shim/user')
export class ShimInstanceUserController implements ControllerPrototype {
  router: Router;
  logger: Logger;
  name: string;
  baseUri: string;
  initRouter: () => void;

  @Get(
    '/all',
    JWTSecurity.preRequestHandler(
      [RoleName.ADMIN, RoleName.USER],
      PermissionName.READ,
    ),
  )
  async getAll(): Promise<{ users: InstanceUser[] }> {
    const error = HttpErrorFactory.instance('getAll', this.logger);
    return await ShimService.send('/instance/user/all', {}, error);
  }

  @Post('/verify')
  async verify(
    request: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const error = HttpErrorFactory.instance('getAll', this.logger);
    const result: {
      ok: boolean;
      user?: InstanceUser;
    } = await ShimService.send(
      '/instance/user/verify',
      { email: request.body.email, password: request.body.password },
      error,
    );
    if (!result.ok) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, ResponseCode.get('a003'));
    }
    return {
      accessToken: JWTEncoding.encode(
        JWTSecurity.createToken(
          `${result.user._id}`,
          result.user.roles,
          JWTConfigService.get('user-token-config'),
          user.customPool,
        ),
      ),
      refreshToken: refreshToken.value,
    };
  }
}
