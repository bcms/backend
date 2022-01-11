import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSSocketEventType,
  BCMSTag,
  BCMSTagCreateData,
  BCMSUserCustomPool,
} from '@bcms/types';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSTagRequestHandler {
  static async getAll(): Promise<BCMSTag[]> {
    return await BCMSRepo.tag.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSTag[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.tag.findAllById(ids);
    } else {
      return await BCMSRepo.tag.methods.findAllByCid(ids);
    }
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSTag> {
    const tag =
      id.length === 24
        ? await BCMSRepo.tag.findById(id)
        : await BCMSRepo.tag.methods.findByCid(id);
    if (!tag) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tag001', { id }),
      );
    }
    return tag;
  }
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSTagCreateData;
  }): Promise<BCMSTag> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('tags');
    if (!idc) {
      const tagIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'tags',
        name: 'Tags',
      });
      const addIdcResult = await BCMSRepo.idc.add(tagIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    if (body.value === '') {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('tag009'),
      );
    }
    const existTag = await BCMSRepo.tag.methods.findByValue(body.value);
    if (existTag) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('tag002', { value: body.value }),
      );
    }
    const tag = BCMSFactory.tag.create({
      cid: idc.toString(16),
      value: body.value,
    });
    const addedTag = await BCMSRepo.tag.add(tag);
    if (!addedTag) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tag003'),
      );
    }
    await BCMSSocketManager.emit.tag({
      tagId: addedTag._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('tag');
    return addedTag;
  }
}
