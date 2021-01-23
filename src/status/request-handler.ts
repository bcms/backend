import {
  HttpErrorFactory,
  HttpStatus,
  Logger,
  ObjectUtility,
  StringUtility,
} from '@becomes/purple-cheetah';
import { CacheControl } from '../cache';
import { ResponseCode } from '../response-code';
import { General, SocketUtil, SocketEventName } from '../util';
import { StatusFactory } from './factory';
import { FSStatus, Status } from './models';
import {
  AddStatusData,
  AddStatusDataSchema,
  UpdateStatusData,
  UpdateStatusDataSchema,
} from './types';
import { StatusUtility } from './util';

export class StatusRequestHandler {
  private static readonly logger = new Logger('StatusRequestHandler');

  static async getAll(): Promise<Array<Status | FSStatus>> {
    return await CacheControl.status.findAll();
  }
  static async getById(id: string): Promise<Status | FSStatus> {
    const error = HttpErrorFactory.instance('getById', this.logger);
    const status = await CacheControl.status.findById(id);
    if (!status) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('sts001', {
          id,
        }),
      );
    }
    return status;
  }
  static async add(
    data: AddStatusData,
    sid: string,
  ): Promise<Status | FSStatus> {
    const error = HttpErrorFactory.instance('add', this.logger);
    try {
      ObjectUtility.compareWithSchema(data, AddStatusDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', { msg: e.message }),
      );
    }
    const status = StatusFactory.instance;
    status.label = data.label;
    status.name = General.labelToName(data.label);
    const statusWithSameName = await CacheControl.status.findByName(
      status.name,
    );
    if (statusWithSameName) {
      throw error.occurred(
        HttpStatus.FORBIDDEN,
        ResponseCode.get('sts002', { name: status.name }),
      );
    }
    if (data.color) {
      if (!StatusUtility.isColorOk(data.color)) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('sts006', {
            color: data.color,
          }),
        );
      }
      status.color = data.color;
    }
    const addResult = await CacheControl.status.add(status, async () => {
      SocketUtil.emit(SocketEventName.STATUS, {
        entry: {
          _id: `${status._id}`,
        },
        message: '',
        source: '',
        type: 'remove',
      });
    });
    if (!addResult) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('sts003'),
      );
    }
    SocketUtil.emit(SocketEventName.STATUS, {
      entry: {
        _id: `${status._id}`,
      },
      message: 'Status hes been added.',
      source: sid,
      type: 'add',
    });
    return status;
  }
  static async update(
    data: UpdateStatusData,
    sid: string,
  ): Promise<Status | FSStatus> {
    const error = HttpErrorFactory.instance('update', this.logger);
    if (!StringUtility.isIdValid(data._id)) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id: data._id }),
      );
    }
    try {
      ObjectUtility.compareWithSchema(data, UpdateStatusDataSchema, 'data');
    } catch (e) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g002', { msg: e.message }),
      );
    }
    const status = await CacheControl.status.findById(data._id);
    if (!status) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('sts001', {
          id: data._id,
        }),
      );
    }
    let changeDetected = false;
    if (typeof data.label === 'string' && data.label !== status.label) {
      changeDetected = true;
      const newName = General.labelToName(data.label);
      if (status.name !== newName) {
        const statusWithSameName = await CacheControl.status.findByName(
          newName,
        );
        if (statusWithSameName) {
          throw error.occurred(
            HttpStatus.FORBIDDEN,
            ResponseCode.get('sts002', { name: newName }),
          );
        }
        status.name = newName;
      }
    }
    if (typeof data.color === 'string' && data.color !== status.color) {
      changeDetected = true;
      if (!StatusUtility.isColorOk(data.color)) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          ResponseCode.get('sts006', {
            color: data.color,
          }),
        );
      }
      status.color = data.color;
    }
    if (!changeDetected) {
      throw error.occurred(HttpStatus.BAD_REQUEST, ResponseCode.get('g003'));
    }
    const updateResult = await CacheControl.status.update(
      status,
      async (type) => {
        SocketUtil.emit(SocketEventName.STATUS, {
          entry: {
            _id: `${status._id}`,
          },
          message: '',
          source: '',
          type,
        });
      },
    );
    if (!updateResult) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('sts004'),
      );
    }
    SocketUtil.emit(SocketEventName.STATUS, {
      entry: {
        _id: `${status._id}`,
      },
      message: 'Status hes been updated.',
      source: sid,
      type: 'update',
    });
    return status;
  }
  static async deleteById(id: string, sid: string): Promise<void> {
    const error = HttpErrorFactory.instance('deleteById', this.logger);
    if (!StringUtility.isIdValid(id)) {
      throw error.occurred(
        HttpStatus.BAD_REQUEST,
        ResponseCode.get('g004', { id }),
      );
    }
    const status = await CacheControl.status.findById(id);
    if (!status) {
      throw error.occurred(
        HttpStatus.NOT_FOUNT,
        ResponseCode.get('sts001', {
          id,
        }),
      );
    }
    await CacheControl.entry.clearAllStatuses(`${status._id}`);
    const deleteResult = await CacheControl.status.deleteById(
      `${status._id}`,
      async () => {
        SocketUtil.emit(SocketEventName.STATUS, {
          entry: {
            _id: `${status._id}`,
          },
          message: '',
          source: '',
          type: 'add',
        });
      },
    );
    if (!deleteResult) {
      throw error.occurred(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ResponseCode.get('sts005'),
      );
    }
    SocketUtil.emit(SocketEventName.STATUS, {
      entry: {
        _id: `${status._id}`,
      },
      message: 'Status hes been deleted.',
      source: sid,
      type: 'remove',
    });
  }
}
