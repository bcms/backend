import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSColor,
  BCMSColorCreateData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSColorRequestHandler {
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
    const checkHex = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/g;
    if (!body.value.match(checkHex)) {
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
}
