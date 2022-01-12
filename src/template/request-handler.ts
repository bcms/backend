import { BCMSRepo } from '@bcms/repo';
import type { BCMSTemplate } from '@bcms/types';

export class BCMSTemplateRequestHandler {
  static async getAll(): Promise<BCMSTemplate[]> {
    return await BCMSRepo.template.findAll();
  }
  static async getMany(ids: string[]): Promise<BCMSTemplate[]> {
    if (ids[0] && ids[0].length === 24) {
      return await BCMSRepo.template.findAllById(ids);
    } else {
      return await BCMSRepo.template.methods.findAllByCid(ids);
    }
  }
  static async count(): Promise<number> {
    return await BCMSRepo.template.count();
  }
}
