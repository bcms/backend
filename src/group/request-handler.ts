import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSGroup, BCMSGroupAddData, BCMSSocketEventType, BCMSUserCustomPool } from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSGroupRequestHandler {
  static async getAll(): Promise<BCMSGroup[]> {
    return await BCMSRepo.group.findAll();
  }
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>
    errorHandler: HTTPError;
    body: BCMSGroupAddData;
  }): Promise<BCMSGroup> {
    let idc = await BCMSRepo.idc.methods.findAndIncByForId('groups');
    if (!idc) {
      const groupIdc = BCMSFactory.idc.create({
        count: 2,
        forId: 'groups',
        name: 'Groups',
      });
      const addIdcResult = await BCMSRepo.idc.add(groupIdc);
      if (!addIdcResult) {
        throw errorHandler.occurred(
          HTTPStatus.INTERNAL_SERVER_ERROR,
          'Failed to add IDC to the database.',
        );
      }
      idc = 1;
    }
    const group = BCMSFactory.group.create({
      cid: idc.toString(16),
      desc: body.desc,
      label: body.label,
      name: StringUtility.toSlugUnderscore(body.label),
    });
    if (await BCMSRepo.group.methods.findByName(group.name)) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('grp002', { name: group.name }),
      );
    }
    const addedGroup = await BCMSRepo.group.add(group);
    if (!addedGroup) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('grp003'),
      );
    }
    await BCMSSocketManager.emit.group({
      groupId: addedGroup._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('group');
    return addedGroup;
  }
}
