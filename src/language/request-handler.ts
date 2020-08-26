import {
  CreateLogger,
  Logger,
  HttpErrorFactory,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  HttpStatus,
  StringUtility,
  ObjectUtility,
} from '@becomes/purple-cheetah';
import { Language, FSLanguage } from './models';
import { ResponseCode } from '../response-code';
import { CacheControl } from '../cache';
import {
  AddLanguageData,
  AddLanguageDataSchema,
  UpdateLanguageData,
  UpdateLanguageDataSchema,
} from './interfaces';
import { LanguageFactory } from './factories';
import { SocketUtil, SocketEventName } from '../util';

export class LanguageRequestHandler {
  @CreateLogger(LanguageRequestHandler)
  private static logger: Logger;

  static async getAll(
    authorization: string,
  ): Promise<Array<Language | FSLanguage>> {
    const error = HttpErrorFactory.instance('getAll', this.logger);
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
    return await CacheControl.language.findAll();
  }

  static async count(authorization: string): Promise<number> {
    const error = HttpErrorFactory.instance('count', this.logger);
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
    return await CacheControl.language.count();
  }

  static async getById(
    authorization: string,
    id: string,
  ): Promise<Language | FSLanguage> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
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
    const language = await CacheControl.language.findById(id);
    if (!language) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('lng001', { id }),
      );
    }
    return language;
  }

  static async add(
    authorization: string,
    data: AddLanguageData,
  ): Promise<Language | FSLanguage> {
    const error = HttpErrorFactory.instance('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, AddLanguageDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
      permission: PermissionName.WRITE,
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
    const language = LanguageFactory.instance;
    language.name = data.name;
    language.code = data.code;
    language.nativeName = data.nativeName;
    if (await CacheControl.language.findByCode(language.code)) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('lng002', { code: language.code }),
      );
    }
    const addResult = await CacheControl.language.add(language);
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('lng003'),
      );
    }
    // TODO: Add new Language to existing Entries.
    return language;
  }

  static async update(
    authorization: string,
    data: UpdateLanguageData,
    sid: string,
  ): Promise<Language | FSLanguage> {
    const error = HttpErrorFactory.instance('update', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, UpdateLanguageDataSchema, 'data');
    } catch (err) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: err.message,
        }),
      );
    }
    if (StringUtility.isIdValid(data._id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: data._id }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
      permission: PermissionName.WRITE,
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
    let language: Language | FSLanguage;
    {
      const l = await CacheControl.language.findById(data._id);
      if (!l) {
        throw error.occurred(
          HttpStatus.NOT_FOUNT,
          ResponseCode.get('lng001', { id: data._id }),
        );
      }
      language = JSON.parse(JSON.stringify(l));
    }
    let switchDefault: Language | FSLanguage;
    let changeDetected = false;
    if (typeof data.def !== 'undefined' && data.def === true) {
      changeDetected = true;
      const defLng = await CacheControl.language.findDefault();
      if (defLng) {
        switchDefault = JSON.parse(JSON.stringify(defLng));
        switchDefault.def = false;
      }
      language.def = true;
    }
    if (!changeDetected) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
    }
    const updateResult = await CacheControl.language.update(language);
    if (updateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('lng005'),
      );
    }
    if (switchDefault) {
      await CacheControl.language.update(switchDefault);
      SocketUtil.emit(SocketEventName.LANGUAGE, {
        entry: {
          _id: `${switchDefault._id}`,
        },
        message: 'Language is no longer default.',
        source: '',
        type: 'update',
      });
    }
    SocketUtil.emit(SocketEventName.LANGUAGE, {
      entry: {
        _id: `${language._id}`,
      },
      message: 'Language has been set to default.',
      source: sid,
      type: 'update',
    });
    return language;
  }

  static async deleteById(authorization: string, id: string) {
    const error = HttpErrorFactory.instance('deleteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
      permission: PermissionName.DELETE,
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
    const language = await CacheControl.language.findById(id);
    if (!language) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('lng001', { id }),
      );
    }
    if (language.def) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('lng007'),
      );
    }
    const deleteResult = await CacheControl.language.deleteById(id);
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('lng006'),
      );
    }
    // TODO: Remove Language from existing Entries.
  }
}
