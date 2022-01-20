import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSSocketEventType,
  BCMSUserCustomPool,
  BCMSWidget,
  BCMSWidgetCreateData,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSWidgetRequestHandler {
  static async getAll(): Promise<BCMSWidget[]> {
    return await BCMSRepo.widget.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSWidget[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.widget.findAllById(ids);
    } else {
      return await BCMSRepo.widget.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.widget.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSWidget> {
    const widget =
      id.length === 24
        ? await BCMSRepo.widget.findById(id)
        : await BCMSRepo.widget.methods.findByCid(id);
    if (!widget) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('wid001', { id }),
      );
    }
    return widget;
  }
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSWidgetCreateData;
  }): Promise<BCMSWidget> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('widgets');
    if (!idc) {
      const widgetIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'widgets',
        name: 'Widgets',
      });
      const addIdcResult = await BCMSRepo.idc.add(widgetIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    const widget = BCMSFactory.widget.create({
      cid: idc.toString(16),
      desc: body.desc,
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      previewImage: body.previewImage,
      previewScript: body.previewScript,
      previewStyle: body.previewStyle,
    });
    if (await BCMSRepo.widget.methods.findByName(widget.name)) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('wid002', { name: widget.name }),
      );
    }
    const addedWidget = await BCMSRepo.widget.add(widget);
    if (!addedWidget) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('wid003'),
      );
    }
    await BCMSSocketManager.emit.widget({
      widgetId: addedWidget._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('widget');
    return addedWidget;
  }
}
