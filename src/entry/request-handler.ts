import { Entry, FSEntry } from './models';
import {
  HttpErrorFactory,
  Logger,
  CreateLogger,
  JWTSecurity,
  RoleName,
  PermissionName,
  JWTConfigService,
  HttpStatus,
  StringUtility,
  ObjectUtility,
} from '@becomes/purple-cheetah';
import { ResponseCode } from '../response-code';
import { ApiKeySecurity, ApiKeyRequestObject } from '../api';
import { CacheControl } from '../cache';
import { EntryLite, AddEntryData, AddEntryDataSchema } from './interfaces';
import { EntryFactory } from './factory';

export class EntryRequestHandler {
  @CreateLogger(EntryRequestHandler)
  private static logger: Logger;

  static async getAll(authorization: string): Promise<Array<Entry | FSEntry>> {
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
    return await CacheControl.entry.findAll();
  }

  static async getAllLite(authorization: string): Promise<EntryLite[]> {
    const error = HttpErrorFactory.instance('getAllLite', this.logger);
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
    return (await CacheControl.entry.findAll()).map((entry) => {
      return EntryFactory.toLite(entry);
    });
  }

  static async getAllByTemplateId(
    authorization: string,
    templateId: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Array<Entry | FSEntry>> {
    const error = HttpErrorFactory.instance('getAllByTemplateId', this.logger);
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { templateId }),
      );
    }
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
    return await CacheControl.entry.findAllByTemplateId(templateId);
  }

  static async getAllLiteByTemplateId(
    authorization: string,
    templateId: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<EntryLite[]> {
    const error = HttpErrorFactory.instance(
      'getAllLiteByTemplateId',
      this.logger,
    );
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { templateId }),
      );
    }
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
    return (await CacheControl.entry.findAllByTemplateId(templateId)).map(
      (entry) => {
        return EntryFactory.toLite(entry);
      },
    );
  }

  static async getById(
    authorization: string,
    id: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Entry | FSEntry> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
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
    return await CacheControl.entry.findById(id);
  }

  static async add(
    authorization: string,
    data: AddEntryData,
  ): Promise<Entry | FSEntry> {
    const error = HttpErrorFactory.instance('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, AddEntryDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
      roles: [RoleName.ADMIN, RoleName.USER],
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
  }
}
