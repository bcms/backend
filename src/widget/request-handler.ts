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
import {
  AddWidgetData,
  AddWidgetDataSchema,
  UpdateWidgetData,
  UpdateWidgetDataSchema,
} from './interfaces';
import { WidgetFactory } from './factories';
import { Prop, PropFactory } from '../prop';
import { General, SocketUtil, SocketEventName } from '../util';

export class WidgetRequestHandler {
  @CreateLogger(WidgetRequestHandler)
  private static logger: Logger;

  static async getAll(
    authorization: string,
  ): Promise<Array<Widget | FSWidget>> {
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
    sid: string,
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
    widget.label = data.label;
    widget.name = General.labelToName(data.label);
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
        ResponseCode.get('wid003'),
      );
    }
    SocketUtil.emit(SocketEventName.WIDGET, {
      entry: {
        _id: `${widget._id}`,
      },
      message: 'Widget has been added.',
      source: sid,
      type: 'add',
    });
    return widget;
  }

  static async update(
    authorization: string,
    data: UpdateWidgetData,
    sid: string,
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
    if (typeof data.label !== 'undefined') {
      const name = General.labelToName(data.label);
      if (widget.name !== name) {
        changeDetected = true;
        widget.label = data.label;
        widget.name = name;
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
          widget.props = widget.props.filter(
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
          if (widget.props.find((e) => e.name === prop.name)) {
            throw error.occurred(
              HttpStatus.BAD_REQUEST,
              ResponseCode.get('wid004', {
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
              ResponseCode.get('wid004', {
                prop: `data.propChanges[${i}]`,
                msg: err.message,
              }),
            );
          }
          widget.props.push(prop);
        } else if (propChange.update) {
          updateEntries = true;
          changeDetected = true;
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < widget.props.length; j = j + 1) {
            if (widget.props[j].label === propChange.update.label.old) {
              widget.props[j].label = propChange.update.label.new;
              widget.props[j].name = General.labelToName(
                propChange.update.label.new,
              );
              widget.props[j].required = propChange.update.required;
            }
          }
        }
      }
    }
    if (changeDetected === true) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
    }
    try {
      await PropHandler.testInfiniteLoop(widget.props);
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('wid004', {
          prop: `widget.props`,
          msg: e.message,
        }),
      );
    }
    try {
      widget._schema = await PropHandler.propsToSchema(widget.props, 'widget');
    } catch (e) {
      this.logger.error('update', e);
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('g006', {
          error: e.message,
        }),
      );
    }
    const updateResult = await CacheControl.widget.update(widget);
    if (updateResult === false) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('wid005'),
      );
    }
    if (updateEntries) {
      // TODO: Update widget in Entries.
    }
    SocketUtil.emit(SocketEventName.WIDGET, {
      entry: {
        _id: `${widget._id}`,
      },
      message: 'Widget has been updated.',
      source: sid,
      type: 'update',
    });
    return widget;
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
        ResponseCode.get('wid006'),
      );
    }
    // TODO: Remove Widget from Entries.
    SocketUtil.emit(SocketEventName.WIDGET, {
      entry: {
        _id: `${widget._id}`,
      },
      message: 'Widget has been removed.',
      source: sid,
      type: 'remove',
    });
  }
}
