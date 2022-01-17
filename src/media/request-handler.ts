import { BCMSRepo } from '@bcms/repo';
import type { BCMSMedia, BCMSMediaAggregate } from '@bcms/types';
import { BCMSMediaService } from './service';

export class BCMSMediaRequestHandler {
  static async getAll(): Promise<BCMSMedia[]> {
    return await BCMSRepo.media.findAll();
  }
  static async getAllAggregated(): Promise<BCMSMediaAggregate[]> {
    return await BCMSMediaService.aggregateFromRoot();
  }
}
