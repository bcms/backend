import { ApiKeyAccess, ApiKey, FSApiKey } from './models';
import {
  HttpErrorFactory,
  CreateLogger,
  Logger,
  HttpStatus,
  StringUtility,
  ObjectUtility,
  JWT,
} from '@becomes/purple-cheetah';
import { CacheControl } from '../_cache';
import { ResponseCode } from '../_response-code';
import {
  AddApiKeyData,
  AddApiKeyDataSchema,
  UpdateApiKeyData,
  UpdateApiKeyDataSchema,
} from './interfaces';
import { ApiKeyFactory } from './factories';
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../_event';
import { SocketEventName, SocketUtil } from '../_util';
import { ApiKeyManager } from './manager';
import { UserCustomPool } from '../_user';

export class ApiKeyRequestHandler {
  @CreateLogger(ApiKeyRequestHandler)
  private static logger: Logger;

  static async getAccessList(key: ApiKey | FSApiKey): Promise<ApiKeyAccess> {
    return key.access;
  }

  static async count(): Promise<number> {
    return await CacheControl.apiKey.count();
  }

  static async getAll(): Promise<Array<ApiKey | FSApiKey>> {
    return await CacheControl.apiKey.findAll();
  }

  static async getById(id: string): Promise<ApiKey | FSApiKey> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
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

  static async add(
    jwt: JWT<UserCustomPool>,
    sid: string,
    data: AddApiKeyData,
  ): Promise<ApiKey | FSApiKey> {
    const error = HttpErrorFactory.instance('add', this.logger);
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
    const rewriteResult = ApiKeyManager.rewriteKey(
      ApiKeyFactory.instance(
        jwt.payload.userId,
        data.name,
        data.desc,
        data.blocked,
        data.access,
      ),
    );
    const addResult = await CacheControl.apiKey.add(
      rewriteResult.key,
      async () => {
        SocketUtil.emit(SocketEventName.API_KEY, {
          entry: {
            _id: `${rewriteResult.key._id}`,
          },
          message: '',
          source: '',
          type: 'remove',
        });
      },
    );
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('ak003'),
      );
    }
    await EventManager.emit(
      BCMSEventConfigScope.API_KEY,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(rewriteResult.key)),
    );
    SocketUtil.emit(SocketEventName.API_KEY, {
      entry: {
        _id: `${rewriteResult.key._id}`,
      },
      message: 'Api Key has been added.',
      source: sid,
      type: 'add',
    });
    return rewriteResult.key;
  }

  static async update(
    sid: string,
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
    const updateResult = await CacheControl.apiKey.update(key, async (type) => {
      SocketUtil.emit(SocketEventName.API_KEY, {
        entry: {
          _id: `${key._id}`,
        },
        message: '',
        source: '',
        type,
      });
    });
    if (!updateResult) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('ak005'),
      );
    }
    await EventManager.emit(
      BCMSEventConfigScope.API_KEY,
      BCMSEventConfigMethod.UPDATE,
      JSON.parse(JSON.stringify(key)),
    );
    SocketUtil.emit(SocketEventName.API_KEY, {
      entry: {
        _id: `${key._id}`,
      },
      message: 'Api Key has been updated.',
      source: sid,
      type: 'update',
    });
    return key;
  }

  static async deleteById(sid: string, id: string) {
    const error = HttpErrorFactory.instance('deleteById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    const key = await CacheControl.apiKey.findById(id);
    if (!key) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('sk001', { id }),
      );
    }
    const deleteResult = await CacheControl.apiKey.deleteById(id, async () => {
      SocketUtil.emit(SocketEventName.API_KEY, {
        entry: {
          _id: `${key._id}`,
        },
        message: '',
        source: '',
        type: 'add',
      });
    });
    if (!deleteResult) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('ak006'),
      );
    }
    await EventManager.emit(
      BCMSEventConfigScope.API_KEY,
      BCMSEventConfigMethod.DELETE,
      JSON.parse(JSON.stringify(key)),
    );
    SocketUtil.emit(SocketEventName.API_KEY, {
      entry: {
        _id: `${key._id}`,
      },
      message: 'Api Key has been removed.',
      source: sid,
      type: 'remove',
    });
  }
}
