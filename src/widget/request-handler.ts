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
import { PropChange, PropType } from '../prop';
import { General, SocketUtil, SocketEventName } from '../util';
import {
  EventManager,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
} from '../event';
import { PropWidget } from 'src/prop/interfaces/quill';

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

  static async getMany(
    authorization: string,
    idsString: string,
  ): Promise<Array<Widget | FSWidget>> {
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
    return await CacheControl.widget.findAllById(ids);
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
    await EventManager.emit(
      BCMSEventConfigScope.WIDGET,
      BCMSEventConfigMethod.ADD,
      JSON.parse(JSON.stringify(widget)),
    );
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
    if (
      typeof data.propChanges !== 'undefined' &&
      data.propChanges.length > 0
    ) {
      updateEntries = true;
      changeDetected = true;
      const result = await PropHandler.applyPropChanges(
        widget.props,
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
      widget.props = result;
    }
    if (!changeDetected) {
      throw error.occurred(HttpStatus.FORBIDDEN, ResponseCode.get('g003'));
    }
    let output = await PropHandler.testInfiniteLoop(widget.props);
    if (output instanceof Error) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g008', {
          msg: output.message,
        }),
      );
    }
    output = await PropHandler.propsChecker(
      widget.props,
      widget.props,
      'widget.props',
    );
    if (output instanceof Error) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g007', {
          msg: output.message,
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
      try {
        await this.propsUpdate(widget, data.propChanges);
      } catch (e) {
        this.logger.error('update', e);
        throw error.occurred(
          HttpStatus.INTERNAL_SERVER_ERROR,
          ResponseCode.get('wid007', {
            msg: e.message,
          }),
        );
      }
    }
    SocketUtil.emit(SocketEventName.WIDGET, {
      entry: {
        _id: `${widget._id}`,
      },
      message: 'Widget has been updated.',
      source: sid,
      type: 'update',
    });
    await EventManager.emit(
      BCMSEventConfigScope.WIDGET,
      BCMSEventConfigMethod.UPDATE,
      JSON.parse(JSON.stringify(widget)),
    );
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
    const entries = await CacheControl.entry.findAll();
    const updatedEntries: string[] = [];
    for (const i in entries) {
      const entry = entries[i];
      for (const j in entry.content) {
        const content = entry.content[j];
        const deletePropsIndex: number[] = [];
        // tslint:disable-next-line: prefer-for-of
        for (let k = 0; k < content.props.length; k = k + 1) {
          const prop = content.props[k];
          if (prop.type === PropType.WIDGET) {
            const value = prop.value as PropWidget;
            if (value._id === id) {
              deletePropsIndex.push(k);
            }
          }
        }
        if (deletePropsIndex.length > 0) {
          entry.content[j].props = entry.content[j].props.filter(
            (e, k) => !deletePropsIndex.includes(k),
          );
          updatedEntries.push(`${entry._id}`);
          await CacheControl.entry.update(entry);
        }
      }
    }
    SocketUtil.emit(SocketEventName.WIDGET, {
      entry: {
        _id: `${widget._id}`,
      },
      message: {
        updated: [
          {
            name: 'entry',
            ids: updatedEntries,
          },
        ],
      },
      source: '',
      type: 'remove',
    });
    await EventManager.emit(
      BCMSEventConfigScope.WIDGET,
      BCMSEventConfigMethod.DELETE,
      JSON.parse(JSON.stringify(widget)),
    );
  }

  private static async propsUpdate(
    widget: Widget | FSWidget,
    propChanges: PropChange[],
  ) {
    const entries = await CacheControl.entry.findAll();
    for (const i in entries) {
      const entry = entries[i];
      for (const j in entry.content) {
        const content = entry.content[j];
        for (const k in content.props) {
          const prop = content.props[k];
          if (prop.type === PropType.WIDGET) {
            const value = prop.value as PropWidget;
            if (value._id === `${widget._id}`) {
              const output = await PropHandler.applyPropChanges(
                value.props,
                propChanges,
                `${entry._id}.content[${j}].props[${k}].value.props`,
              );
              if (output instanceof Error) {
                throw output;
              }
              value.props = output;
              entry.content[j].props[k].value = value;
              await CacheControl.entry.update(entry);
            }
          }
        }
      }
    }
  }
}
