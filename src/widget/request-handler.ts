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
import { ResponseCode } from '../response-code';
import { CacheControl } from '../cache';
import { PropHandler } from '../prop/handler';
import { Widget, FSWidget } from './models';
import { AddWidgetData, AddWidgetDataSchema, UpdateWidgetData, UpdateWidgetDataSchema } from './interfaces';
import { WidgetFactory } from './factories';

export class WidgetRequestHandler {
  @CreateLogger(WidgetRequestHandler)
  private static logger: Logger;

  static async getAll(authorization: string): Promise<Array<Widget | FSWidget>> {
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
    const widgets = await CacheControl.widget.findAll();
    return widgets;
  }

  static async getById(
    authorization: string,
    id: string,
  ): Promise<Widget | FSWidget> {
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
    const widget = await CacheControl.widget.findById(id);
    if (!widget) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('wid001', { id }),
      );
    }
    return widget;
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
    return await CacheControl.widget.count();
  }

  static async add(
    authorization: string,
    data: AddWidgetData,
  ): Promise<Widget | FSWidget> {
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
      ObjectUtility.compareWithSchema(data, AddWidgetDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', {
          msg: e.message,
        }),
      );
    }
    const widget = WidgetFactory.instance();
    widget.name = StringUtility.createSlug(data.name);
    widget.desc = data.desc;
    if (await CacheControl.widget.findByName(widget.name)) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('wid002', { name: widget.name }),
      );
    }
    const addResult = await CacheControl.widget.add(widget);
    if (addResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('grp003'),
      );
    }
    return widget;
  }

  static async update(
    authorization: string,
    data: UpdateWidgetData,
  ): Promise<Widget | FSWidget> {
    const error = HttpErrorFactory.instance('update', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, UpdateWidgetDataSchema, 'data');
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
    let widget: Widget | FSWidget;
    {
      const w = await CacheControl.widget.findById(data._id);
      if (!w) {
        throw error.occurred(
          HttpStatus.NOT_FOUNT,
          ResponseCode.get('wid001', { id: data._id }),
        );
      }
      widget = JSON.parse(JSON.stringify(w));
    }
    let changeDetected = false;
    if (typeof data.name !== 'undefined') {
      data.name = StringUtility.createSlug(data.name);
      if (widget.name !== data.name) {
        changeDetected = true;
        widget.name = StringUtility.createSlug(data.name);
        if (await CacheControl.widget.findByName(widget.name)) {
          throw error.occurred(
            HttpStatus.FORBIDDEN,
            ResponseCode.get('wid002', { name: widget.name }),
          );
        }
      }
    }
    if (typeof data.desc !== 'undefined' && data.desc !== widget.desc) {
      changeDetected = true;
      widget.desc = data.desc;
    }
    let updateEntries = false;
    if (typeof data.propChanges !== 'undefined') {
      for (const i in data.propChanges) {
        const propChange = data.propChanges[i];
        if (propChange.remove) {
          updateEntries = true;
          changeDetected = true;
          widget.props = widget.props.filter((e) => e.name !== propChange.remove);
        } else if (propChange.add) {
          updateEntries = true;
          changeDetected = true;
          try {
            PropHandler.verifyValue([propChange.add]);
          } catch (err) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('grp004', {
                prop: `data.propChanger[${i}]`,
                msg: err.message,
              }),
            );
          }
          widget.props.push(propChange.add);
        } else if (propChange.update) {
          updateEntries = true;
          changeDetected = true;
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < widget.props.length; j = j + 1) {
            if (widget.props[j].name === propChange.update.name.old) {
              widget.props[j].name = StringUtility.createSlug(
                propChange.update.name.new,
              ).replace(/-/g, '_');
              widget.props[j].required = propChange.update.required;
            }
          }
        }
      }
    }
    if (changeDetected === true) {
      const updateResult = await CacheControl.widget.update(widget);
      if (updateResult === false) {
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ResponseCode.get('grp005'),
        );
      }
    }
    if (updateEntries) {
      // TODO: Update widget in Entries.
    }
    return widget;
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
    const widget = await CacheControl.widget.findById(id);
    if (!widget) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('wid001', { id }),
      );
    }
    const deleteResult = await CacheControl.widget.deleteById(id);
    if (deleteResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('grp006'),
      );
    }
    // TODO: Remove Widget from Entries.
  }
}
