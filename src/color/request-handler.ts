import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSColor,
  BCMSColorCreateData,
  BCMSColorUpdateData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';
import { BCMSColorService } from './service';

export class BCMSColorRequestHandler {
  static async getAll(): Promise<BCMSColor[]> {
    return await BCMSRepo.color.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSColor[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.color.findAllById(ids);
    } else {
      return await BCMSRepo.color.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.color.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSColor> {
    const color =
      id.length === 24
        ? await BCMSRepo.color.findById(id)
        : await BCMSRepo.color.methods.findByCid(id);
    if (!color) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('col001', { id }),
      );
    }
    return color;
  }
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSColorCreateData;
  }): Promise<BCMSColor> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('colors');
    if (!idc) {
      const colorIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'colors',
        name: 'Colors',
      });
      const addIdcResult = await BCMSRepo.idc.add(colorIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    if (!body.source.id) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        'The value of the color origin is not entered',
      );
    }
    if (body.source.type === 'group') {
      const group = await BCMSRepo.group.findById(body.source.id);
      if (!group) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('grp001', { id: body.source.id }),
        );
      }
    } else if (body.source.type === 'widget') {
      const widget = await BCMSRepo.widget.findById(body.source.id);
      if (!widget) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('wid001', { id: body.source.id }),
        );
      }
    } else if (body.source.type === 'template') {
      const template = await BCMSRepo.template.findById(body.source.id);
      if (!template) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('tmp001', { id: body.source.id }),
        );
      }
    } else {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        'The value of the color origin is not entered',
      );
    }

    if (!(await BCMSColorService.check(body.value))) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('col010'),
      );
    }
    const color = BCMSFactory.color.create({
      cid: idc.toString(16),
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      value: body.value,
      userId: accessToken.payload.userId,
      source: {
        id: body.source.id,
        type: body.source.type,
      },
    });
    const addedColor = await BCMSRepo.color.add(color);
    if (!addedColor) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('grp003'),
      );
    }
    await BCMSSocketManager.emit.color({
      colorId: addedColor._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('color');
    return addedColor;
  }
  static async update({
    errorHandler,
    body,
    accessToken,
  }: {
    body: BCMSColorUpdateData;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
  }): Promise<BCMSColor> {
    const color = await BCMSRepo.color.findById(body._id);
    if (!color) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('col001', { id: body._id }),
      );
    }
    let changeDetected = false;
    if (typeof body.label === 'string' && body.label !== color.label) {
      changeDetected = true;
      color.label = body.label;
      color.name = StringUtility.toSlugUnderscore(body.label);
    }
    if (typeof body.value === 'string' && body.value !== color.value) {
      if (!(await BCMSColorService.check(body.value))) {
        throw errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          bcmsResCode('col010'),
        );
      }
      changeDetected = true;
      color.value = body.value;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    const updatedColor = await BCMSRepo.color.update(color);
    if (!updatedColor) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('col005'),
      );
    }
    await BCMSSocketManager.emit.color({
      colorId: updatedColor._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('color');

    return updatedColor;
  }
  static async delete({
    errorHandler,
    id,
    accessToken,
  }: {
    id: string;
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
  }): Promise<void> {
    const color = await BCMSRepo.color.findById(id);
    if (!color) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('col001', { id: id }),
      );
    }
    const deleteResult = await BCMSRepo.color.deleteById(id);
    if (!deleteResult) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('col006'),
      );
    }
    await BCMSSocketManager.emit.color({
      colorId: color._id,
      type: BCMSSocketEventType.REMOVE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('color');
  }
}
