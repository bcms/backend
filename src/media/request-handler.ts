import { BCMSRepo } from '@bcms/repo';
import type { BCMSMedia } from '@bcms/types';

export class BCMSMediaRequestHandler {
  static async getAll(): Promise<BCMSMedia[]> {
    return await BCMSRepo.media.findAll();
  }
}
