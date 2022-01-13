import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSSocketEventType,
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSTemplateOrganizerRequestHandler {
  static async getAll(): Promise<BCMSTemplateOrganizer[]> {
    return await BCMSRepo.templateOrganizer.findAll();
  }
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSTemplateOrganizerCreateData;
  }): Promise<BCMSTemplateOrganizer> {
    const org = BCMSFactory.templateOrganizer.create({
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      parentId: body.parentId,
      templateIds: body.templateIds,
    });
    const addedOrg = await BCMSRepo.templateOrganizer.add(org);
    if (!addedOrg) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('tpo003'),
      );
    }
    await BCMSSocketManager.emit.templateOrganizer({
      templateOrganizerId: addedOrg._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    return addedOrg;
  }
}
