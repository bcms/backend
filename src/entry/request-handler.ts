import { Entry, FSEntry, EntryMeta, EntryContent } from './models';
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
  EntryParsed,
} from './interfaces';
import { EntryFactory } from './factory';
import { PropHandler, PropType } from '../prop';
import { SocketUtil, SocketEventName } from '../util';
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../event';
import { EntryParser } from './parser';

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
        await ApiKeySecurity.verify(apiRequest);
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

  static async getAllByTemplateIdParsed(
    authorization: string,
    templateId: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<EntryParsed[]> {
    const error = HttpErrorFactory.instance(
      'getAllByTemplateIdParsed',
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
        await ApiKeySecurity.verify(apiRequest);
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
    const entries = await CacheControl.entry.findAllByTemplateId(templateId);
    const entriesParsed: EntryParsed[] = [];
    for (const i in entries) {
      const entry = entries[i];
      try {
        entriesParsed.push(await EntryParser.parse(entry));
      } catch (e) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          `Parsing entry "${entry._id}" failed with message: ${e.message}`,
        );
      }
    }
    return entriesParsed;
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
        await ApiKeySecurity.verify(apiRequest);
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
    apiRequest?: ApiKeyRequestObject,
  ): Promise<number> {
    const error = HttpErrorFactory.instance('countByTemplateId', this.logger);
    if (StringUtility.isIdValid(templateId) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { templateId }),
      );
    }
    if (apiRequest) {
      try {
        await ApiKeySecurity.verify(apiRequest);
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
        await ApiKeySecurity.verify(apiRequest);
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
    apiRequest?: ApiKeyRequestObject,
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
    let userId: string;
    if (apiRequest) {
      try {
        await ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
      userId = `key_${apiRequest.data.key}`;
    } else {
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
      userId = jwt.payload.userId;
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
    const content: EntryContent[] = [];
    for (const i in languages) {
      const lngMeta = data.meta.find((e) => e.lng === languages[i].code);
      const lngContent = data.content.find((e) => e.lng === languages[i].code);
      if (!lngMeta) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr002', {
            lng: languages[i].name,
            prop: 'meta',
          }),
        );
      }
      if (!lngContent) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr002', {
            lng: languages[i].name,
            prop: 'content',
          }),
        );
      }
      const metaCheckResult = await PropHandler.propsChecker(
        lngMeta.props,
        template.props,
        `data.meta[${i}].props`,
      );
      if (metaCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr003', {
            error: metaCheckResult.message,
            prop: 'meta',
          }),
        );
      }
      const contentCheckResult = await PropHandler.propsValidate(
        lngContent.props,
        `data.content[${i}].props`,
      );
      if (contentCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr003', {
            error: contentCheckResult.message,
            prop: 'content',
          }),
        );
      }
      let title = false;
      let slug = false;
      lngMeta.props.forEach((e) => {
        if (e.name === 'title') {
          title = true;
        } else if (e.name === 'slug') {
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
      content.push(lngContent);
    }
    const entry = EntryFactory.instance;
    entry.templateId = data.templateId;
    entry.userId = userId;
    entry.meta = meta;
    entry.content = content;
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
        additional: {
          templateId: entry.templateId,
        },
      },
      message: 'Entry added.',
      source: sid,
      type: 'add',
    });
    await EventManager.emit(
      BCMSEventConfigScope.ENTRY,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(entry)),
    );
    return entry;
  }

  static async update(
    authorization: string,
    data: UpdateEntryData,
    sid: string,
    apiRequest?: ApiKeyRequestObject,
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
    if (apiRequest) {
      try {
        await ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
    } else {
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
    const content: EntryContent[] = [];
    for (const i in languages) {
      const lngMeta = data.meta.find((e) => e.lng === languages[i].code);
      const lngContent = data.content.find((e) => e.lng === languages[i].code);
      if (!lngMeta) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr002', {
            lng: languages[i].name,
            prop: 'meta',
          }),
        );
      }
      if (!lngContent) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr002', {
            lng: languages[i].name,
            prop: 'content',
          }),
        );
      }
      const metaCheckResult = await PropHandler.propsChecker(
        lngMeta.props,
        template.props,
        `data.meta[${i}].props`,
      );
      if (metaCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr003', {
            error: metaCheckResult.message,
            prop: 'meta',
          }),
        );
      }
      const contentCheckResult = await PropHandler.propsValidate(
        lngContent.props,
        `data.content[${i}].props`,
      );
      if (contentCheckResult instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('etr003', {
            error: contentCheckResult.message,
            prop: 'content',
          }),
        );
      }
      let title = false;
      let slug = false;
      lngMeta.props.forEach((e) => {
        if (e.name === 'title') {
          title = true;
        } else if (e.name === 'slug') {
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
      content.push(lngContent);
    }
    entry.meta = meta;
    entry.content = content;
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
        additional: {
          templateId: entry.templateId,
        },
      },
      message: 'Entry updated.',
      source: sid,
      type: 'update',
    });
    await EventManager.emit(
      BCMSEventConfigScope.ENTRY,
      BCMSEventConfigMethod.UPDATE,
      JSON.parse(JSON.stringify(entry)),
    );
    return entry;
  }

  static async deleteById(
    authorization: string,
    id: string,
    sid: string,
    apiRequest?: ApiKeyRequestObject,
  ) {
    const error = HttpErrorFactory.instance('deleteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    if (apiRequest) {
      try {
        await ApiKeySecurity.verify(apiRequest);
      } catch (e) {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          ResponseCode.get('ak007', { msg: e.message }),
        );
      }
    } else {
      const jwt = JWTSecurity.checkAndValidateAndGet(authorization, {
        roles: [RoleName.ADMIN, RoleName.USER],
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
        additional: {
          templateId: entry.templateId,
        },
      },
      message: 'Entry removed.',
      source: sid,
      type: 'remove',
    });
    await EventManager.emit(
      BCMSEventConfigScope.ENTRY,
      BCMSEventConfigMethod.DELETE,
      JSON.parse(JSON.stringify(entry)),
    );
  }
}
