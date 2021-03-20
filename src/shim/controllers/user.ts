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
  JWTSecurity as PurpleCheetahJWTSecurity,
} from '@becomes/purple-cheetah';
import { Request, Router } from 'express';
import { JWTSecurity } from '../../security';
import { ShimInstanceUser } from '../types';
import { ShimService } from '../service';
import { ResponseCode } from '../../response-code';
import { UserFactory } from '../../user';

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
  async getAll(): Promise<{ users: ShimInstanceUser[] }> {
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
      user?: ShimInstanceUser;
    } = await ShimService.send(
      '/instance/user/verify',
      { email: request.body.email, password: request.body.password },
      error,
    );
    if (!result.ok) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, ResponseCode.get('a003'));
    }
    const user = UserFactory.admin({
      username: result.user.username,
      avatarUri: '',
      email: '',
      firstName: '',
      lastName: '',
    })
    return {
      accessToken: JWTEncoding.encode(
        PurpleCheetahJWTSecurity.createToken(
          `${result.user._id}`,
          result.user.roles,
          JWTConfigService.get('user-token-config'),
          {

          },
        ),
      ),
      refreshToken: refreshToken.value,
    };
  }
}
