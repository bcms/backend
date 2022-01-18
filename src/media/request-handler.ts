import * as crypto from 'crypto';
import imageSize from 'image-size';
import * as util from 'util';
import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import {
  BCMSMedia,
  BCMSMediaAddDirData,
  BCMSMediaAggregate,
  BCMSMediaType,
  BCMSMediaUpdateData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus, Logger } from '@becomes/purple-cheetah/types';
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
  }): Promise<BCMSMediaAggregate> {
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
        path: await BCMSMediaService.getPath(media),
      };
    }
    return await BCMSMediaService.aggregateFromParent({
      parent: media,
    });
  }
  static async createFile({
    accessToken,
    errorHandler,
    parentId,
    file,
    logger,
    name,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    name: string;
    logger: Logger;
    parentId: string;
    file: Express.Multer.File | undefined;
  }): Promise<BCMSMedia> {
    if (!file) {
      throw errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        bcmsResCode('mda009'),
      );
    }
    let parent: BCMSMedia | null = null;
    if (parentId) {
      parent = await BCMSRepo.media.findById(parentId);
      if (!parent) {
        throw errorHandler.occurred(
          HTTPStatus.NOT_FOUNT,
          bcmsResCode('mda001', { id: parentId }),
        );
      }
    }
    const fileInfo = BCMSMediaService.getNameAndExt(file.originalname);
    const media = BCMSFactory.media.create({
      userId: accessToken.payload.userId,
      type: BCMSMediaService.mimetypeToMediaType(file.mimetype),
      mimetype: file.mimetype,
      size: file.size,
      name: `${StringUtility.toSlug(fileInfo.name)}${
        fileInfo.ext ? '.' + fileInfo.ext : ''
      }`,
      isInRoot: !parent,
      hasChildren: false,
      parentId: parentId ? parentId : '',
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
    await BCMSMediaService.storage.save(media, file.buffer);
    if (media.type === BCMSMediaType.IMG) {
      try {
        const dimensions = await util.promisify(imageSize)(
          await BCMSMediaService.storage.getPath({ media }),
        );
        if (!dimensions) {
          throw errorHandler.occurred(
            HTTPStatus.NOT_FOUNT,
            bcmsResCode('mda013'),
          );
        }
        media.width = dimensions.width as number;
        media.height = dimensions.height as number;
      } catch (error) {
        logger.error(name, error);
      }
    }
    const addedMedia = await BCMSRepo.media.add(media);
    if (!addedMedia) {
      await BCMSMediaService.storage.removeFile(media);
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda003'),
      );
    }

    await BCMSSocketManager.emit.media({
      mediaId: addedMedia._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    return addedMedia;
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
  static async update({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSMediaUpdateData;
  }): Promise<BCMSMedia> {
    const media = await BCMSRepo.media.findById(body._id);
    if (!media) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('mda001', { id: body._id }),
      );
    }
    const oldMedia = JSON.parse(JSON.stringify(media));
    if (media.type === BCMSMediaType.DIR) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda005'),
      );
    }
    let changeDetected = false;
    const mediaNameInfo = BCMSMediaService.getNameAndExt(media.name);

    if (typeof body.name === 'string' && body.name !== mediaNameInfo.name) {
      const name = `${StringUtility.toSlug(body.name)}${
        mediaNameInfo.ext ? '.' + mediaNameInfo.ext : ''
      }`;

      if (
        await BCMSRepo.media.methods.findByNameAndParentId(name, media.parentId)
      ) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          bcmsResCode('mda002', { name }),
        );
      }

      changeDetected = true;
      media.name = name;
    }
    if (typeof body.altText === 'string' && body.altText !== media.altText) {
      changeDetected = true;
      media.altText = body.altText;
    }
    if (typeof body.caption === 'string' && body.caption !== media.caption) {
      changeDetected = true;
      media.caption = body.caption;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.FORBIDDEN, bcmsResCode('g003'));
    }
    await BCMSMediaService.storage.rename(oldMedia, media);
    const updateMedia = await BCMSRepo.media.update(media);
    if (!updateMedia) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('mda005'),
      );
    }
    await BCMSSocketManager.emit.media({
      mediaId: updateMedia._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('media');
    return updateMedia;
  }
}
