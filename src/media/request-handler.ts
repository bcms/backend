import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import type { BCMSMedia, BCMSMediaAggregate } from '@bcms/types';
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
}
