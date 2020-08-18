import {
  Logger,
  CreateLogger,
  HttpErrorFactory,
  HttpStatus,
  JWTEncoding,
  JWTSecurity,
  JWTConfigService,
} from '@becomes/purple-cheetah';
import * as bcrypt from 'bcrypt';
import { UserRepo, RefreshTokenFactory, User, FSUser } from '../user';
import { General } from '../util';
import { ResponseCode } from '../response-code';
import { Types } from 'mongoose';

// TODO: Add IP blacklist
export class AuthRequestHandler {
  @CreateLogger(AuthRequestHandler)
  private static logger: Logger;

  static async login(
    authorization: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    await General.delay(2000);
    const error = HttpErrorFactory.instance('login', this.logger);
    if (!authorization) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('a001'));
    }
    const auth = {
      email: '',
      password: '',
    };
    try {
      const parts = Buffer.from(authorization.replace('Basic ', ''), 'base64')
        .toString()
        .split(':');
      if (parts.length !== 2) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          'Invalid authorization format.',
        );
      }
      auth.email = parts[0];
      auth.password = parts[1];
    } catch (e) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('a002'));
    }
    const user = await UserRepo.findByEmail(auth.email);
    if (!user || user === null) {
      this.logger.warn('login', 'Bad email.');
      throw error.occurred(HttpStatus.UNAUTHORIZED, ResponseCode.get('a003'));
    }
    const checkPassword = await bcrypt.compare(auth.password, user.password);
    if (checkPassword === false) {
      this.logger.warn('login', 'Bad password');
      throw error.occurred(HttpStatus.UNAUTHORIZED, ResponseCode.get('a003'));
    }
    const refreshToken = RefreshTokenFactory.instance;
    user.refreshTokens.push(refreshToken);
    const updateUserResult = await UserRepo.update(user as any);
    if (updateUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('a004'),
      );
    }
    return {
      accessToken: JWTEncoding.encode(
        JWTSecurity.createToken(
          user._id instanceof Types.ObjectId
            ? (user._id as any).toHexString()
            : user._id,
          user.roles,
          JWTConfigService.get('user-token-config'),
          user.customPool,
        ),
      ),
      refreshToken: refreshToken.value,
    };
  }

  static async refreshAccess(authorization: string): Promise<string> {
    const error = HttpErrorFactory.instance('refreshAccess', this.logger);
    if (!authorization) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('a001'));
    }
    const user = await UserRepo.findByRefreshToken(
      authorization.replace('Bearer ', ''),
    );
    if (!user) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, ResponseCode.get('a005'));
    }
    return JWTEncoding.encode(
      JWTSecurity.createToken(
        user._id instanceof Types.ObjectId
          ? (user._id as any).toHexString()
          : user._id,
        user.roles,
        JWTConfigService.get('user-token-config'),
        user.customPool,
      ),
    );
  }

  static async logout(authorization: string): Promise<string> {
    const error = HttpErrorFactory.instance('logout', this.logger);
    if (!authorization) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('a001'));
    }
    const refreshTokenValue = authorization.replace('Bearer ', '');
    const user = await UserRepo.findByRefreshToken(refreshTokenValue);
    if (!user) {
      throw error.occurred(HttpStatus.UNAUTHORIZED, ResponseCode.get('a005'));
    }
    user.refreshTokens = user.refreshTokens.filter(
      (e) => e.value !== refreshTokenValue,
    );
    const updateUserResult = await UserRepo.update(user as any);
    if (updateUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('a004'),
      );
    }
    return 'Success.';
  }
}
