import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  CreateLogger,
  Logger,
  HttpErrorFactory,
  JWTSecurity,
  RoleName,
  JWTConfigService,
  HttpStatus,
  ObjectUtility,
  JWTEncoding,
  StringUtility,
  JWT,
} from '@becomes/purple-cheetah';
import { FSUser, User, ProtectedUser } from './models';
import { UserFactory, RefreshTokenFactory } from './factories';
import {
  UpdateUserData,
  UpdateUserDataSchema,
  AddUserData,
  AddUserDataSchema,
} from './interfaces';
import { ResponseCode } from '../response-code';
import { CacheControl } from '../cache';
import { SocketUtil, SocketEventName } from '../util';
import { LanguageFactory } from '../language';

export class UserRequestHandler {
  @CreateLogger(UserRequestHandler)
  private static logger: Logger;
  private static aSecret = {
    expAt: 0,
    code: '',
  };

  static async count(): Promise<number> {
    return await CacheControl.user.count();
  }

  static async isInitialized(): Promise<boolean> {
    const userCount = await CacheControl.user.count();
    return userCount > 0 ? true : false;
  }

  static async getAll(): Promise<ProtectedUser[]> {
    const users = await CacheControl.user.findAll();
    return (users as Array<FSUser | User>).map((user) => {
      return UserFactory.removeProtected(user);
    });
  }

  static async getByAccessToken(jwt: JWT): Promise<ProtectedUser> {
    const error = HttpErrorFactory.instance('getByAccessToken', this.logger);
    const user = await CacheControl.user.findById(jwt.payload.userId);
    if (!user) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('u001'),
      );
    }
    return UserFactory.removeProtected(user);
  }

  static async getById(id: string): Promise<ProtectedUser> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    const user = await CacheControl.user.findById(id);
    if (!user || user === null) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('g002', {
          id,
        }),
      );
    }
    return UserFactory.removeProtected(user);
  }

  static async update(
    jwt: JWT,
    data: UpdateUserData,
    sid: string,
  ): Promise<ProtectedUser> {
    const error = HttpErrorFactory.instance('update', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, UpdateUserDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    if (
      jwt.payload.userId !== data._id &&
      !jwt.payload.roles.find((role) => role.name === RoleName.ADMIN)
    ) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('u003'));
    }
    const user = await CacheControl.user.findById(data._id);
    if (!user || user === null) {
      if (jwt.payload.userId === data._id) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ResponseCode.get('u004'),
        );
      }
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('u002', {
          id: data._id,
        }),
      );
    }
    let change = false;
    if (typeof data.email !== 'undefined' && data.email !== user.email) {
      change = true;
      const userWithSameEmail = await CacheControl.user.findByEmail(data.email);
      if (userWithSameEmail && userWithSameEmail !== null) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          ResponseCode.get('u006', {
            email: data.email,
          }),
        );
      }
      user.email = data.email;
    }
    if (typeof data.password !== 'undefined') {
      change = true;
      if (
        jwt.payload.roles.find((role) => role.name === RoleName.ADMIN) &&
        jwt.payload.userId !== data._id
      ) {
        user.password = await bcrypt.hash(data.password.new, 10);
      } else {
        if (
          (await bcrypt.compare(data.password.current, user.password)) === false
        ) {
          throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('u007'));
        }
        user.password = await bcrypt.hash(data.password.new, 10);
      }
    }
    if (typeof data.customPool !== 'undefined') {
      if (typeof data.customPool.personal !== 'undefined') {
        if (
          typeof data.customPool.personal.firstName !== 'undefined' &&
          data.customPool.personal.firstName !==
            user.customPool.personal.firstName
        ) {
          change = true;
          user.customPool.personal.firstName =
            data.customPool.personal.firstName;
          user.username =
            user.customPool.personal.firstName +
            ' ' +
            user.customPool.personal.lastName;
        }
        if (
          typeof data.customPool.personal.lastName !== 'undefined' &&
          data.customPool.personal.lastName !==
            user.customPool.personal.lastName
        ) {
          change = true;
          user.customPool.personal.lastName = data.customPool.personal.lastName;
          user.username =
            user.customPool.personal.firstName +
            ' ' +
            user.customPool.personal.lastName;
        }
      }
      if (typeof data.customPool.address !== 'undefined') {
        if (
          typeof data.customPool.address.city !== 'undefined' &&
          user.customPool.address.city !== data.customPool.address.city
        ) {
          change = true;
          user.customPool.address.city = data.customPool.address.city;
        }
        if (
          typeof data.customPool.address.country !== 'undefined' &&
          user.customPool.address.country !== data.customPool.address.country
        ) {
          change = true;
          user.customPool.address.country = data.customPool.address.country;
        }
        if (
          typeof data.customPool.address.state !== 'undefined' &&
          user.customPool.address.state !== data.customPool.address.state
        ) {
          change = true;
          user.customPool.address.state = data.customPool.address.state;
        }
        if (
          typeof data.customPool.address.zip !== 'undefined' &&
          user.customPool.address.zip !== data.customPool.address.zip
        ) {
          change = true;
          user.customPool.address.zip = data.customPool.address.zip;
        }
        if (typeof data.customPool.address.street !== 'undefined') {
          if (
            typeof data.customPool.address.street.name !== 'undefined' &&
            data.customPool.address.street.name !==
              user.customPool.address.street.name
          ) {
            change = true;
            user.customPool.address.street.name =
              data.customPool.address.street.name;
          }
          if (
            typeof data.customPool.address.street.number !== 'undefined' &&
            data.customPool.address.street.number !==
              user.customPool.address.street.number
          ) {
            change = true;
            user.customPool.address.street.number =
              data.customPool.address.street.number;
          }
        }
      }
      if (typeof data.customPool.policy !== 'undefined') {
        if (!jwt.payload.roles.find((role) => role.name === RoleName.ADMIN)) {
          throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('u008'));
        }
        if (typeof data.customPool.policy.customPortal !== 'undefined') {
          change = true;
          user.customPool.policy.customPortal =
            data.customPool.policy.customPortal;
        }
        if (typeof data.customPool.policy.templates !== 'undefined') {
          change = true;
          user.customPool.policy.templates = data.customPool.policy.templates;
        }
        if (typeof data.customPool.policy.media !== 'undefined') {
          change = true;
          user.customPool.policy.media = data.customPool.policy.media;
        }
        if (typeof data.customPool.policy.webhooks !== 'undefined') {
          change = true;
          user.customPool.policy.webhooks = data.customPool.policy.webhooks;
        }
        if (typeof data.customPool.policy.plugins !== 'undefined') {
          change = true;
          user.customPool.policy.plugins = data.customPool.policy.plugins;
        }
      }
    }
    if (change === false) {
      throw error.occurred(HttpStatus.BAD_REQUEST, ResponseCode.get('g003'));
    }
    const updateUserResult = await CacheControl.user.update(user);
    if (updateUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('u010'),
      );
    }
    SocketUtil.emit(SocketEventName.USER, {
      entry: {
        _id: `${user._id}`,
      },
      message: 'User has been updated.',
      source: sid,
      type: 'update',
    });
    return UserFactory.removeProtected(user);
  }

  static async add(data: AddUserData, sid: string): Promise<ProtectedUser> {
    const error = HttpErrorFactory.instance('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, AddUserDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    {
      const userWithSameEmail = await CacheControl.user.findByEmail(data.email);
      this.logger.info('', userWithSameEmail);
      if (userWithSameEmail) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          ResponseCode.get('u006', {
            email: data.email,
          }),
        );
      }
    }
    const user = UserFactory.user({
      email: data.email,
      username:
        data.customPool.personal.firstName +
        ' ' +
        data.customPool.personal.lastName,
      firstName: data.customPool.personal.firstName,
      lastName: data.customPool.personal.lastName,
    });
    user.password = await bcrypt.hash(data.password, 10);
    const addUserResult = await CacheControl.user.add(user);
    if (addUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('u011'),
      );
    }
    SocketUtil.emit(SocketEventName.USER, {
      entry: {
        _id: `${user._id}`,
      },
      message: 'User has been added.',
      source: sid,
      type: 'add',
    });
    return UserFactory.removeProtected(user);
  }

  static async makeAnAdmin(id: string, sid: string) {
    const error = HttpErrorFactory.instance('makeAnAdmin', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('u013', { id }),
      );
    }
    const user = await CacheControl.user.findById(id);
    if (!user) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('u002', { id }),
      );
    }
    user.roles[0].name = RoleName.ADMIN;
    const updateUserResult = await CacheControl.user.update(user);
    if (updateUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('u010'),
      );
    }
    SocketUtil.emit(SocketEventName.USER, {
      entry: {
        _id: `${user._id}`,
      },
      message: 'User has been updated.',
      source: sid,
      type: 'update',
    });
    return UserFactory.removeProtected(user);
  }

  static adminSecret(): string {
    this.aSecret.expAt = Date.now() + 180000;
    this.aSecret.code = crypto.randomBytes(64).toString('base64');
    this.logger.warn('adminSecret', {
      secret: this.aSecret.code,
    });
    return 'Success.';
  }

  static async adminCreate(data: {
    code: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const error = HttpErrorFactory.instance('adminCreate', this.logger);
    try {
      ObjectUtility.compareWithSchema(
        data,
        {
          code: {
            __type: 'string',
            __required: true,
          },
          email: {
            __type: 'string',
            __required: true,
          },
          password: {
            __type: 'string',
            __required: true,
          },
          firstName: {
            __type: 'string',
            __required: true,
          },
          lastName: {
            __type: 'string',
            __required: true,
          },
        },
        'data',
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    if (this.aSecret.expAt < Date.now() || data.code !== this.aSecret.code) {
      this.aSecret.expAt = 0;
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('u012'));
    }
    this.aSecret.expAt = 0;
    if (
      (await CacheControl.user.findAll()).find(
        (e) => e.roles[0].name === RoleName.ADMIN,
      )
    ) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('u015'));
    }
    {
      const userWithSameEmail = await CacheControl.user.findByEmail(data.email);
      if (userWithSameEmail) {
        throw error.occurred(
          HttpStatus.FORBIDDEN,
          ResponseCode.get('u006', {
            email: data.email,
          }),
        );
      }
    }
    const user = UserFactory.admin({
      email: data.email,
      username: data.firstName + ' ' + data.lastName,
      firstName: data.firstName,
      lastName: data.lastName,
    });
    const refreshToken = RefreshTokenFactory.instance;
    user.password = await bcrypt.hash(data.password, 10);
    user.refreshTokens.push(refreshToken);
    const addUserResult = await CacheControl.user.add(user);
    if (addUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('u011'),
      );
    }
    const defaultLanguage = await CacheControl.language.findByCode('en');
    if (!defaultLanguage) {
      const language = LanguageFactory.instance;
      language.code = 'en';
      (language.name = 'English'), (language.nativeName = 'English');
      await CacheControl.language.add(language);
    }
    return {
      accessToken: JWTEncoding.encode(
        JWTSecurity.createToken(
          `${user._id}`,
          user.roles,
          JWTConfigService.get('user-token-config'),
          user.customPool,
        ),
      ),
      refreshToken: refreshToken.value,
    };
  }

  static async delete(jwt: JWT, id: string, sid: string) {
    const error = HttpErrorFactory.instance('delete', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('u013', {
          id,
        }),
      );
    }
    if (
      jwt.payload.userId !== id &&
      !jwt.payload.roles.find((role) => role.name === RoleName.ADMIN)
    ) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('u014'));
    }
    const user = await CacheControl.user.findById(id);
    if (!user) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('u002', {
          id,
        }),
      );
    }
    const deleteUserResult = await CacheControl.user.deleteById(id);
    if (deleteUserResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('u005'),
      );
    }
    SocketUtil.emit(SocketEventName.USER, {
      entry: {
        _id: `${user._id}`,
      },
      message: 'User has been removed.',
      source: sid,
      type: 'remove',
    });
  }
}
