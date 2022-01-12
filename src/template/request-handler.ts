import { BCMSRepo } from '@bcms/repo';
import type { BCMSTemplate } from '@bcms/types';

export class BCMSTemplateRequestHandler {
  static async getAll(): Promise<BCMSTemplate[]> {
    return await BCMSRepo.template.findAll();
  }
}
