import { ApiKeyAccess, ApiKey, FSApiKey } from './models';
import { ApiKeySecurity, ApiKeySecurityObject } from './security';
import {
  HttpErrorFactory,
  CreateLogger,
  Logger,
  HttpStatus,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  StringUtility,
  ObjectUtility,
} from '@becomes/purple-cheetah';
import { CacheControl } from '../cache';
import { ResponseCode } from '../response-code';
import {
  AddApiKeyData,
  AddApiKeyDataSchema,
  UpdateApiKeyData,
  UpdateApiKeyDataSchema,
} from './interfaces';
import { ApiKeyFactory } from './factories';

export class ApiKeyRequestHandler {
  @CreateLogger(ApiKeyRequestHandler)
  private static logger: Logger;

  static async getAccessList(
    method: string,
    url: string,
    body: any,
    signature: ApiKeySecurityObject,
  ): Promise<ApiKeyAccess> {
    const error = HttpErrorFactory.instance('getKeyAccess', this.logger);
    try {
      await ApiKeySecurity.verify(
        signature,
        body,
        method.toUpperCase(),
        url,
        true,
      );
    } catch (e) {
      throw error.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('ak007', {
          msg: e.message,
        }),
      );
    }
    const key = await CacheControl.apiKey.findById(signature.key);
    return key.access;
  }

  static async getAll(
    authorization: string,
  ): Promise<Array<ApiKey | FSApiKey>> {
    const error = HttpErrorFactory.instance('getAll', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
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
    return await CacheControl.apiKey.findAll();
  }

  static async getById(
    authorization: string,
    id: string,
  ): Promise<ApiKey | FSApiKey> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
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
    const key = await CacheControl.apiKey.findById(id);
    if (!key) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('ak001', { id }),
      );
    }
    return key;
  }

  static async count(authorization: string): Promise<number> {
    const error = HttpErrorFactory.instance('count', this.logger);
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN],
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
    return await CacheControl.apiKey.count();
  }

  static async add(
    authorization: string,
    data: AddApiKeyData,
  ): Promise<ApiKey | FSApiKey> {
    const error = HttpErrorFactory.instance('add', this.logger);
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
    try {
      ObjectUtility.compareWithSchema(data, AddApiKeyDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    const key = ApiKeyFactory.instance(
      jwt.payload.userId,
      data.name,
      data.desc,
      data.blocked,
      data.access,
    );
    const addResult = await CacheControl.apiKey.add(key);
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('ak003'),
      );
    }
    return key;
  }

  static async update(
    authorization: string,
    data: UpdateApiKeyData,
  ): Promise<ApiKey | FSApiKey> {
    const error = HttpErrorFactory.instance('update', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, UpdateApiKeyDataSchema, 'data');
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
    let key: ApiKey | FSApiKey;
    {
      const k = await CacheControl.apiKey.findById(data._id);
      if (!k) {
        throw error.occurred(
          HttpStatus.NOT_FOUNT,
          ResponseCode.get('ak001', { id: data._id }),
        );
      }
      key = JSON.parse(JSON.stringify(k));
    }
    let changeDetected = false;
    if (typeof data.name !== 'undefined' && data.name !== key.name) {
      changeDetected = true;
      key.name = data.name;
    }
    if (typeof data.desc !== 'undefined' && data.desc !== key.desc) {
      changeDetected = true;
      key.desc = data.desc;
    }
    if (typeof data.blocked !== 'undefined' && data.blocked !== key.blocked) {
      changeDetected = true;
      key.blocked = data.blocked;
    }
    if (typeof data.access !== 'undefined') {
      changeDetected = true;
      key.access = data.access;
    }
    if (!changeDetected) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
    }
    const updateResult = await CacheControl.apiKey.update(key);
    if (!updateResult) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('ak005'),
      );
    }
    return key;
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
    const key = await CacheControl.apiKey.findById(id);
    if (!key) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('sk001', { id }),
      );
    }
    const deleteResult = await CacheControl.apiKey.deleteById(id);
    if (!deleteResult) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('ak006'),
      );
    }
  }
}
