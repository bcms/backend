import {
  CreateLogger,
  Logger,
  HttpErrorFactory,
  HttpStatus,
  StringUtility,
  ObjectUtility,
  Queueable,
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
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../event';

export class LanguageRequestHandler {
  @CreateLogger(LanguageRequestHandler)
  private static logger: Logger;
  private static queueable = Queueable<Language | FSLanguage | void>(
    'add',
    'deleteById',
  );

  static async getAll(): Promise<Array<Language | FSLanguage>> {
    return await CacheControl.language.findAll();
  }

  static async count(): Promise<number> {
    return await CacheControl.language.count();
  }

  static async getById(id: string): Promise<Language | FSLanguage> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    if (StringUtility.isIdValid(id) === false) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
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
    data: AddLanguageData,
    sid: string,
  ): Promise<Language | FSLanguage> {
    const error = HttpErrorFactory.instance('add', this.logger);
    return (await this.queueable.exec('add', 'free_one_by_one', async () => {
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
      SocketUtil.emit(SocketEventName.LANGUAGE, {
        entry: {
          _id: `${language._id}`,
        },
        message: 'Language has been added.',
        source: sid,
        type: 'add',
      });
      await EventManager.emit(
        BCMSEventConfigScope.LANGUAGE,
        BCMSEventConfigMethod.ADD,
        JSON.parse(JSON.stringify(language)),
      );
      (await CacheControl.entry.findAll()).forEach(async (entry) => {
        const template = await CacheControl.template.findById(`${entry._id}`);
        if (template) {
          entry.meta.push({
            lng: language.code,
            props: template.props,
          });
          await CacheControl.entry.update(entry);
        }
      });
      return language;
    })) as Language | FSLanguage;
  }

  static async update(
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
      await EventManager.emit(
        BCMSEventConfigScope.LANGUAGE,
        BCMSEventConfigMethod.UPDATE,
        JSON.parse(JSON.stringify(switchDefault)),
      );
    }
    SocketUtil.emit(SocketEventName.LANGUAGE, {
      entry: {
        _id: `${language._id}`,
      },
      message: 'Language has been set to default.',
      source: sid,
      type: 'update',
    });
    await EventManager.emit(
      BCMSEventConfigScope.LANGUAGE,
      BCMSEventConfigMethod.UPDATE,
      JSON.parse(JSON.stringify(language)),
    );
    return language;
  }

  static async deleteById(id: string, sid: string) {
    await this.queueable.exec('deleteById', 'free_one_by_one', async () => {
      const error = HttpErrorFactory.instance('deleteById', this.logger);
      if (StringUtility.isIdValid(id) === false) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g004', { id }),
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
      SocketUtil.emit(SocketEventName.LANGUAGE, {
        entry: {
          _id: `${language._id}`,
        },
        message: 'Language has been removed.',
        source: sid,
        type: 'remove',
      });
      (await CacheControl.entry.findAll()).forEach(async (entry) => {
        entry.meta = entry.meta.filter((m) => m.lng !== language.code);
        await CacheControl.entry.update(entry);
      });
      await EventManager.emit(
        BCMSEventConfigScope.LANGUAGE,
        BCMSEventConfigMethod.DELETE,
        JSON.parse(JSON.stringify(language)),
      );
    });
  }
}
