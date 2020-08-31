import { Entry, FSEntry, EntryMeta } from './models';
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
import {
  EntryLite,
  AddEntryData,
  AddEntryDataSchema,
  UpdateEntryData,
} from './interfaces';
import { EntryFactory } from './factory';
import { PropHandler, PropType } from '../prop';
import { SocketUtil, SocketEventName } from '../util';

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

  static async getManyLite(
    authorization: string,
    idsString: string,
  ): Promise<EntryLite[]> {
    const error = HttpErrorFactory.instance('getManyLite', this.logger);
    if (!idsString) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g010', {
          param: 'ids',
        }),
      );
    }
    const ids: string[] = idsString.split('-').map((id, i) => {
      if (StringUtility.isIdValid(id) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g004', {
            id: `ids[${i}]: ${id}`,
          }),
        );
      }
      return id;
    });
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
    return (await CacheControl.entry.findAllById(ids)).map((entry) => {
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

  static async countByTemplateId(
    authorization: string,
    templateId: string,
  ): Promise<number> {
    const error = HttpErrorFactory.instance('countByTemplateId', this.logger);
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { templateId }),
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
    return await CacheControl.entry.countByTemplateId(templateId);
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
    const entry = await CacheControl.entry.findById(id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('etr001', { id }),
      );
    }
    return entry;
  }

  static async add(
    authorization: string,
    data: AddEntryData,
    sid: string,
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
    if (StringUtility.isIdValid(data.templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: data.templateId }),
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
    const template = await CacheControl.template.findById(data.templateId);
    if (!template) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('tmp001', {
          id: data.templateId,
        }),
      );
    }
    const languages = await CacheControl.language.findAll();
    const meta: EntryMeta[] = [];
    for (const i in languages) {
      const lngMeta = data.meta.find((e) => e.lng === languages[i].code);
      if (!lngMeta) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr002', {
            lng: languages[i].name,
          }),
        );
      }
      const result = await PropHandler.propsChecker(
        lngMeta.props,
        template.props,
        `data.meta["${lngMeta.lng}"].props`,
      );
      if (result instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr003', {
            error: result.message,
          }),
        );
      }
      let title = false;
      let slug = false;
      lngMeta.props.forEach((e) => {
        if (e.name === 'title') {
          title = true;
        } else if (e.name === 'slug') {
          if (typeof e.value[0] === 'string') {
            e.value[0] = StringUtility.createSlug('' + e.value[0]);
          } else {
            e.value = [''];
          }
          slug = true;
        }
      });
      if (!slug) {
        lngMeta.props = [
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      if (!title) {
        lngMeta.props = [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      meta.push(lngMeta);
    }
    const entry = EntryFactory.instance;
    entry.templateId = data.templateId;
    entry.userId = jwt.payload.userId;
    entry.meta = meta;
    const addResult = await CacheControl.entry.add(entry);
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('etr004'),
      );
    }
    SocketUtil.emit(SocketEventName.ENTRY, {
      entry: {
        _id: `${entry._id}`,
      },
      message: 'Entry added.',
      source: sid,
      type: 'add',
    });
    return entry;
  }

  static async update(
    authorization: string,
    data: UpdateEntryData,
    sid: string,
  ): Promise<Entry | FSEntry> {
    const error = HttpErrorFactory.instance('update', this.logger);
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
    if (StringUtility.isIdValid(data.templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: `templateId: ${data.templateId}` }),
      );
    }
    if (StringUtility.isIdValid(data._id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: `_id: ${data._id}` }),
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
    const entry = await CacheControl.entry.findById(data._id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('etr001', {
          id: data._id,
        }),
      );
    }
    const template = await CacheControl.template.findById(data.templateId);
    if (!template) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('tmp001', {
          id: data.templateId,
        }),
      );
    }
    const languages = await CacheControl.language.findAll();
    const meta: EntryMeta[] = [];
    for (const i in languages) {
      const lngMeta = data.meta.find((e) => e.lng === languages[i].code);
      if (!lngMeta) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr002', {
            lng: languages[i].name,
          }),
        );
      }
      const result = await PropHandler.propsChecker(
        lngMeta.props,
        template.props,
      );
      if (result instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr003', {
            error: result.message,
          }),
        );
      }
      let title = false;
      let slug = false;
      lngMeta.props.forEach((e) => {
        if (e.name === 'title') {
          title = true;
        } else if (e.name === 'slug') {
          if (typeof e.value[0] === 'string') {
            e.value[0] = StringUtility.createSlug(e.value[0]);
          } else {
            e.value = [''];
          }
          slug = true;
        }
      });
      if (!slug) {
        lngMeta.props = [
          {
            label: 'Slug',
            name: 'slug',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      if (!title) {
        lngMeta.props = [
          {
            label: 'Title',
            name: 'title',
            array: false,
            required: true,
            type: PropType.STRING,
            value: [''],
          },
          ...lngMeta.props,
        ];
      }
      meta.push(lngMeta);
    }
    entry.meta = meta;
    const updateResult = await CacheControl.entry.update(entry);
    if (updateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('etr004'),
      );
    }
    SocketUtil.emit(SocketEventName.ENTRY, {
      entry: {
        _id: `${entry._id}`,
      },
      message: 'Entry updated.',
      source: sid,
      type: 'update',
    });
    return entry;
  }

  static async deleteById(authorization: string, id: string, sid: string) {
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
    const entry = await CacheControl.entry.findById(id);
    if (!entry) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('etr001', { id }),
      );
    }
    const deleteResult = await CacheControl.entry.deleteById(id);
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('etr006'),
      );
    }
    SocketUtil.emit(SocketEventName.ENTRY, {
      entry: {
        _id: `${entry._id}`,
      },
      message: 'Entry removed.',
      source: sid,
      type: 'remove',
    });
  }
}
