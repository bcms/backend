import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSSocketEventType,
  BCMSTemplate,
  BCMSTemplateCreateData,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
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
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSTemplateCreateData;
  }): Promise<BCMSTemplate> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('templates');
    if (!idc) {
      const templateIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'templates',
        name: 'Templates',
      });
      const addIdcResult = await BCMSRepo.idc.add(templateIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    const template = BCMSFactory.template.create({
      cid: idc.toString(16),
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      desc: body.desc,
      singleEntry: body.singleEntry,
      userId: accessToken.payload.userId,
    });
    const templateWithSameName = await BCMSRepo.template.methods.findByName(
      template.name,
    );
    if (templateWithSameName) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('tmp002', { name: template.name }),
      );
    }
    const addedTemplate = await BCMSRepo.template.add(template);
    if (!addedTemplate) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tmp003'),
      );
    }
    await BCMSSocketManager.emit.template({
      templateId: addedTemplate._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('templates');
    return addedTemplate;
  }
}
