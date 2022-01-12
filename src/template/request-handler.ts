import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import type { BCMSTemplate } from '@bcms/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

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
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSTemplate> {
    const template =
      id.length === 24
        ? await BCMSRepo.template.findById(id)
        : await BCMSRepo.template.methods.findByCid(id);
    if (!template) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('tmp001', { id }),
      );
    }
    return template;
  }
}
