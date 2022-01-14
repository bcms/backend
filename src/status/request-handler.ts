import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSSocketEventType,
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSStatusUpdateData,
  BCMSUserCustomPool,
} from '@bcms/types';
import { StringUtility } from '@becomes/purple-cheetah';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSStatusRequestHandler {
  static async getAll(): Promise<BCMSStatus[]> {
    return await BCMSRepo.status.findAll();
  }
  static async count(): Promise<number> {
    return await BCMSRepo.status.count();
  }
  static async getById({
    id,
    errorHandler,
  }: {
    id: string;
    errorHandler: HTTPError;
  }): Promise<BCMSStatus> {
    const status = await BCMSRepo.status.findById(id);
    if (!status) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('sts001', {
          id,
        }),
      );
    }
    return status;
  }
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
  static async update({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSStatusUpdateData;
  }): Promise<BCMSStatus> {
    const id = body._id;
    const status = await BCMSRepo.status.findById(id);
    if (!status) {
      throw errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        bcmsResCode('sts001', {
          id,
        }),
      );
    }
    let changeDetected = false;
    if (typeof body.label === 'string' && status.label !== body.label) {
      changeDetected = true;
      const newName = StringUtility.toSlugUnderscore(body.label);
      if (status.name !== newName) {
        const statusWithSameName = await BCMSRepo.status.methods.findByName(
          newName,
        );
        if (statusWithSameName) {
          throw errorHandler.occurred(
            HTTPStatus.FORBIDDEN,
            bcmsResCode('sts002', { name: newName }),
          );
        }
        status.name = newName;
      }
      status.label = body.label;
    }
    if (typeof body.color === 'string' && status.color !== body.color) {
      changeDetected = true;
      status.color = body.color;
    }
    if (!changeDetected) {
      throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, bcmsResCode('g003'));
    }
    const updatedStatus = await BCMSRepo.status.update(status);
    if (!updatedStatus) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('sts004'),
      );
    }
    await BCMSSocketManager.emit.status({
      statusId: updatedStatus._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('status');
    return updatedStatus;
  }
}
