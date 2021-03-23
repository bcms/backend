import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  Controller,
  ControllerPrototype,
  Get,
  HttpErrorFactory,
  HttpStatus,
  JWTConfigService,
  JWTEncoding,
  JWTSecurity as PurpleCheetahJWTSecurity,
  Logger,
  PermissionName,
  Post,
  RoleName,
} from '@becomes/purple-cheetah';
import { Request, Router } from 'express';
import { JWTSecurity } from '../../security';
import { ShimInstanceUser } from '../types';
import { ShimService } from '../service';
import { ResponseCode } from '../../response-code';
import { RefreshTokenFactory, UserFactory } from '../../user';
import { CacheControl } from '../../cache';
import { SocketEventName, SocketUtil } from '../../util';

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

  @Post('/verify/otp')
  async verifyWithOTP(
    request: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const error = HttpErrorFactory.instance('verifyWithOTP', this.logger);
    const result: {
      ok: boolean;
      user?: ShimInstanceUser;
    } = await ShimService.send(
      '/instance/user/verify/otp',
      { otp: request.body.otp },
      error,
    );
    if (!result.ok) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, ResponseCode.get('a003'));
    }
    let user = await CacheControl.user.findById(result.user._id);
    const refreshToken = RefreshTokenFactory.instance;
    if (!user) {
      if (result.user.roles[0].name === RoleName.ADMIN) {
        user = UserFactory.admin({
          email: result.user.email,
          avatarUri: '',
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          username: result.user.username,
        });
      } else {
        user = UserFactory.user({
          email: result.user.email,
          avatarUri: '',
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          username: result.user.username,
        });
      }
      user.password = await bcrypt.hash(crypto.randomBytes(64), 10);
      user.refreshTokens = [refreshToken];
      const addUserResult = await new Promise<boolean>((resolve) => {
        CacheControl.user.add(
          user,
          async () => {
            resolve(false);
          },
          async () => {
            resolve(true);
          },
        );
      });
      if (!addUserResult) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Failed to add user to the database.',
        );
      }
      SocketUtil.emit(SocketEventName.USER, {
        entry: {
          _id: `${user._id}`,
        },
        message: 'User has been added.',
        source: '',
        type: 'add',
      });
    } else {
      user.refreshTokens.push(refreshToken);
    }
    return {
      accessToken: JWTEncoding.encode(
        PurpleCheetahJWTSecurity.createToken(
          `${result.user._id}`,
          result.user.roles,
          JWTConfigService.get('user-token-config'),
          {},
        ),
      ),
      refreshToken: refreshToken.value,
    };
  }
}
