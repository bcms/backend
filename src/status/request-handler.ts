import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSSocketEventType,
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSStatusRequestHandler {
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSStatusCreateData;
  }): Promise<BCMSStatus> {
    const status = BCMSFactory.status.create({
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
      color: body.color,
    });
    const statusWithSameName = await BCMSRepo.status.methods.findByName(
      status.name,
    );
    if (statusWithSameName) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('sts002', { name: status.name }),
      );
    }
    const addedStatus = await BCMSRepo.status.add(status);
    if (!addedStatus) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('sts003'),
      );
    }
    await BCMSSocketManager.emit.status({
      statusId: addedStatus._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('status');
    return addedStatus;
  }
}
