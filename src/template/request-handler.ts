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
  Queueable,
} from '@becomes/purple-cheetah';
import { Template, FSTemplate } from './models';
import { ResponseCode } from '../response-code';
import { CacheControl } from '../cache';
import {
  AddTemplateData,
  AddTemplateDataSchema,
  UpdateTemplateData,
  UpdateTemplateDataSchema,
} from './interfaces';
import { TemplateFactory } from './factories';
import { PropHandler, PropChange } from '../prop';
import { General, SocketUtil, SocketEventName } from '../util';
import { Entry, FSEntry } from '../entry';
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../event';
import { ApiKeyRequestObject, ApiKeySecurity } from '../api';

export class TemplateRequestHandler {
  @CreateLogger(TemplateRequestHandler)
  private static logger: Logger;
  private static queueable = Queueable<Template | FSTemplate | void>('update');

  static async getAll(
    authorization: string,
  ): Promise<Array<Template | FSTemplate>> {
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
    return await CacheControl.template.findAll();
  }

  static async getMany(
    authorization: string,
    idsString: string,
  ): Promise<Array<Template | FSTemplate>> {
    const error = HttpErrorFactory.instance('getMany', this.logger);
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
    return await CacheControl.template.findAllById(ids);
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
    return await CacheControl.template.count();
  }

  static async getById(
    authorization: string,
    id: string,
    apiRequest?: ApiKeyRequestObject,
  ): Promise<Template | FSTemplate> {
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
    const template = await CacheControl.template.findById(id);
    if (!template) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('tmp001', { id }),
      );
    }
    return template;
  }

  static async add(
    authorization: string,
    data: AddTemplateData,
    sid: string,
  ): Promise<Template | FSTemplate> {
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
      ObjectUtility.compareWithSchema(data, AddTemplateDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    const template = TemplateFactory.instance;
    template.label = data.label;
    template.name = General.labelToName(data.label);
    template.desc = data.desc;
    template.singleEntry = data.singleEntry;
    if (await CacheControl.template.findByName(template.name)) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('tmp002', { name: template.name }),
      );
    }
    const addTemplateResult = await CacheControl.template.add(template);
    if (addTemplateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('tmp003'),
      );
    }
    SocketUtil.emit(SocketEventName.TEMPLATE, {
      entry: {
        _id: `${template._id}`,
      },
      message: 'Template has been added.',
      source: sid,
      type: 'add',
    });
    await EventManager.emit(
      BCMSEventConfigScope.TEMPLATE,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(template)),
    );
    return template;
  }

  /**
   * This method will update specified Template and it has
   * side effect. This is done to offload complex and hard
   * work from the client and to ensure consistent data
   * structure in the database. After updating the Template,
   * all Entries which are belonging to it will be updated.
   */
  static async update(
    authorization: string,
    data: UpdateTemplateData,
    sid: string,
  ): Promise<Template | FSTemplate> {
    return (await this.queueable.exec('update', 'free_one_by_one', async () => {
      const error = HttpErrorFactory.instance('update', this.logger);
      try {
        ObjectUtility.compareWithSchema(data, UpdateTemplateDataSchema, 'data');
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
      let template: Template | FSTemplate;
      {
        const t = await CacheControl.template.findById(data._id);
        if (!t) {
          throw error.occurred(
            HttpStatus.NOT_FOUNT,
            ResponseCode.get('tmp001', { id: data._id }),
          );
        }
        template = JSON.parse(JSON.stringify(t));
      }
      let changeDetected = false;
      if (typeof data.label !== 'undefined') {
        const name = General.labelToName(data.label);
        if (name !== template.name) {
          changeDetected = true;
          template.label = data.label;
          template.name = name;
          if (await CacheControl.template.findByName(template.name)) {
            throw error.occurred(
              HttpStatus.FORBIDDEN,
              ResponseCode.get('tmp002', { name: template.name }),
            );
          }
        }
      }
      if (typeof data.desc !== 'undefined' && template.desc !== data.desc) {
        changeDetected = true;
        template.desc = data.desc;
      }
      if (
        typeof data.singleEntry !== 'undefined' &&
        template.singleEntry !== data.singleEntry
      ) {
        changeDetected = true;
        template.singleEntry = data.singleEntry;
      }
      let updateEntries = false;
      if (
        typeof data.propChanges !== 'undefined' &&
        data.propChanges.length > 0
      ) {
        for (const i in data.propChanges) {
          const change = data.propChanges[i];
          if (change.add) {
            const name = General.labelToName(change.add.label);
            if (name === 'title' || name === 'slug') {
              throw error.occurred(
                HttpStatus.FORBIDDEN,
                ResponseCode.get('tmp009', {
                  name,
                }),
              );
            }
          } else if (change.update) {
            if (
              change.update.label.old === 'Title' ||
              change.update.label.old === 'Slug'
            ) {
              throw error.occurred(
                HttpStatus.FORBIDDEN,
                ResponseCode.get('tmp009', {
                  name: change.update.label.old,
                }),
              );
            }
          } else if (change.remove) {
            if (change.remove === 'title' || change.remove === 'slug') {
              throw error.occurred(
                HttpStatus.FORBIDDEN,
                ResponseCode.get('tmp009', {
                  name: change.remove,
                }),
              );
            }
          }
        }
        updateEntries = true;
        changeDetected = true;
        const result = await PropHandler.applyPropChanges(
          template.props,
          data.propChanges,
        );
        if (result instanceof Error) {
          throw error.occurred(
            HttpStatus.BAD_REQUEST,
            ResponseCode.get('g009', {
              msg: result.message,
            }),
          );
        }
        template.props = result;
      }
      if (!changeDetected) {
        throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
      }
      let output = await PropHandler.testInfiniteLoop(template.props);
      if (output instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g008', {
            msg: output.message,
          }),
        );
      }
      output = await PropHandler.propsChecker(
        template.props,
        template.props,
        'template.props',
      );
      if (output instanceof Error) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('g007', {
            msg: output.message,
          }),
        );
      }
      const updateResult = await CacheControl.template.update(template);
      if (updateResult === false) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ResponseCode.get('tmp005'),
        );
      }
      let updated: string[] = [];
      if (updateEntries) {
        try {
          updated = await this.propsUpdate(template, data.propChanges);
        } catch (e) {
          this.logger.error('update', e);
          throw error.occurred(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ResponseCode.get('tmp008', {
              msg: e.message,
            }),
          );
        }
      }
      SocketUtil.emit(SocketEventName.TEMPLATE, {
        entry: {
          _id: `${template._id}`,
        },
        message: {
          updated: [
            {
              name: 'entry',
              ids: updated,
            },
          ],
        },
        source: sid,
        type: 'update',
      });
      await EventManager.emit(
        BCMSEventConfigScope.TEMPLATE,
        BCMSEventConfigMethod.UPDATE,
        JSON.parse(JSON.stringify(template)),
      );
      return template;
    })) as Template | FSTemplate;
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
    const template = await CacheControl.template.findById(id);
    if (!template) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('tmp001', { id }),
      );
    }
    const deleteResult = await CacheControl.template.deleteById(id);
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('tmp006'),
      );
    }
    const entries = await CacheControl.entry.findAllByTemplateId(
      `${template._id}`,
    );
    try {
      await CacheControl.entry.deleteAllByTemplateId(`${template._id}`);
    } catch (e) {
      this.logger.error('deleteById', {
        msg: 'Failed to delete Entries for removed Template.',
        err: e,
      });
    }
    SocketUtil.emit(SocketEventName.TEMPLATE, {
      entry: {
        _id: `${template._id}`,
      },
      message: 'Template has been removed.',
      source: sid,
      type: 'remove',
    });
    await EventManager.emit(
      BCMSEventConfigScope.TEMPLATE,
      BCMSEventConfigMethod.DELETE,
      JSON.parse(JSON.stringify(template)),
    );
  }

  private static async propsUpdate(
    template: Template | FSTemplate,
    propChanges: PropChange[],
  ) {
    const entries = await CacheControl.entry.findAllByTemplateId(
      `${template._id}`,
    );
    for (const i in entries) {
      const entry: Entry | FSEntry = JSON.parse(JSON.stringify(entries[i]));
      for (const j in entry.meta) {
        const meta = entry.meta[j];
        const result = await PropHandler.applyPropChanges(
          meta.props,
          propChanges,
        );
        if (result instanceof Error) {
          throw result;
        }
        entry.meta[j].props = result;
      }
      await CacheControl.entry.update(entry);
    }
    return entries.map((e) => `${e._id}`);
  }
}
