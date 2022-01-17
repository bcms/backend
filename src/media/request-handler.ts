import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import {
  BCMSMedia,
  BCMSMediaAggregate,
  BCMSMediaSimpleAggregate,
  BCMSMediaType,
} from '@bcms/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';
import { BCMSMediaService } from './service';
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
}
