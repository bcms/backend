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
import { PropHandler, Prop, PropFactory } from '../prop';
import { General, SocketUtil, SocketEventName } from '../util';

export class TemplateRequestHandler {
  @CreateLogger(TemplateRequestHandler)
  private static logger: Logger;

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
  ): Promise<Template | FSTemplate> {
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
    return template;
  }

  static async update(
    authorization: string,
    data: UpdateTemplateData,
    sid: string,
  ): Promise<Template | FSTemplate> {
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
    if (typeof data.propChanges !== 'undefined') {
      for (const i in data.propChanges) {
        const propChange = data.propChanges[i];
        if (propChange.remove) {
          updateEntries = true;
          changeDetected = true;
          template.props = template.props.filter(
            (e) => e.name !== propChange.remove,
          );
        } else if (propChange.add) {
          updateEntries = true;
          changeDetected = true;
          const prop: Prop = PropFactory.get(
            propChange.add.type,
            propChange.add.array,
          );
          if (!prop) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('g005', {
                type: propChange.add.type,
              }),
            );
          }
          prop.label = propChange.add.label;
          prop.name = General.labelToName(prop.label);
          prop.required = propChange.add.required;
          if (typeof propChange.add.value !== 'undefined') {
            prop.value = propChange.add.value;
          }
          if (template.props.find((e) => e.name === prop.name)) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('tmp004', {
                prop: `data.propChanges[${i}]`,
                msg: `Prop with name "${prop.name}" already exist at this level.`,
              }),
            );
          }
          try {
            PropHandler.verifyValue([prop]);
          } catch (err) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('tmp004', {
                prop: `data.propChanges[${i}]`,
                msg: err.message,
              }),
            );
          }
          template.props.push(prop);
        } else if (propChange.update) {
          updateEntries = true;
          changeDetected = true;
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < template.props.length; j = j + 1) {
            if (template.props[j].label === propChange.update.label.old) {
              template.props[j].label = propChange.update.label.new;
              template.props[j].name = General.labelToName(
                propChange.update.label.new,
              );
              template.props[j].required = propChange.update.required;
              break;
            }
          }
        }
      }
    }
    if (!changeDetected) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
    }
    try {
      await PropHandler.testInfiniteLoop(template.props);
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('tmp004', {
          prop: `template.props`,
          msg: e.message,
        }),
      );
    }
    try {
      template._schema = await PropHandler.propsToSchema(
        template.props,
        'template',
      );
    } catch (e) {
      this.logger.error('update', e);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('g006', {
          error: e.message,
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
    if (updateEntries) {
      // TODO: Update Entries props for this template.
    }
    SocketUtil.emit(SocketEventName.TEMPLATE, {
      entry: {
        _id: `${template._id}`,
      },
      message: 'Template has been updated.',
      source: sid,
      type: 'update',
    });
    return template;
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
    // TODO: Delete all Entries for this Template.
    SocketUtil.emit(SocketEventName.TEMPLATE, {
      entry: {
        _id: `${template._id}`,
      },
      message: 'Template has been removed.',
      source: sid,
      type: 'remove',
    });
  }
}
