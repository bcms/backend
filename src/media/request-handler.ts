import * as crypto from 'crypto';
import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import {
  BCMSMedia,
  BCMSMediaAddDirData,
  BCMSMediaAggregate,
  BCMSMediaSimpleAggregate,
  BCMSMediaType,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';
import { BCMSMediaService } from './service';
import { BCMSSocketManager } from '@bcms/socket';
export class BCMSMediaRequestHandler {
  static async getAll(): Promise<BCMSMedia[]> {
    return await BCMSRepo.media.findAll();
  }
  static async getAllAggregated(): Promise<BCMSMediaAggregate[]> {
    return await BCMSMediaService.aggregateFromRoot();
  }
  static async getAllByParentId({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSMedia[]> {
    const media = await BCMSRepo.media.findById(id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id }),
      );
    }
    return await BCMSMediaService.getChildren(media);
  }
  static async getMany(ids: string[]): Promise<BCMSMedia[]> {
    return await BCMSRepo.media.findAllById(ids);
  }
  static async count(): Promise<number> {
    return await BCMSRepo.media.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSMedia> {
    const media = await BCMSRepo.media.findById(id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id }),
      );
    }
    return media;
  }

  static async getByIdAggregated({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSMediaSimpleAggregate | BCMSMediaAggregate> {
    const media = await BCMSRepo.media.findById(id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id }),
      );
    }

    if (media.type !== BCMSMediaType.DIR) {
      return {
        _id: media._id,
        createdAt: media.createdAt,
        updatedAt: media.updatedAt,
        isInRoot: media.isInRoot,
        mimetype: media.mimetype,
        name: media.name,
        size: media.size,
        state: false,
        type: media.type,
        userId: media.userId,
      } as BCMSMediaSimpleAggregate;
    }
    return (await BCMSMediaService.aggregateFromParent({
      parent: media,
    })) as BCMSMediaAggregate;
  }
  static async createDir({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSMediaAddDirData;
  }): Promise<BCMSMedia> {
    let parent: BCMSMedia | null = null;
    if (body.parentId) {
      parent = await BCMSRepo.media.findById(body.parentId);
      if (!parent) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('mda001', { id: body.parentId }),
        );
      }
    }
    body.name = StringUtility.toSlug(body.name);
    const media = BCMSFactory.media.create({
      userId: accessToken.payload.userId,
      type: BCMSMediaType.DIR,
      mimetype: 'dir',
      name: body.name,
      isInRoot: !parent,
      parentId: parent ? parent._id : '',
      hasChildren: true,
      altText: '',
      caption: '',
      height: -1,
      width: -1,
    });
    if (
      await BCMSRepo.media.methods.findByNameAndParentId(
        media.name,
        parent ? parent._id : undefined,
      )
    ) {
      media.name = crypto.randomBytes(6).toString('hex') + '-' + media.name;
    }
    const addedMedia = await BCMSRepo.media.add(media);
    if (!addedMedia) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda003'),
      );
    }
    await BCMSMediaService.storage.mkdir(addedMedia);
    await BCMSSocketManager.emit.media({
      mediaId: addedMedia._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    return addedMedia;
  }
}
