import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSApiKey,
  BCMSApiKeyAddData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSApiKeyRequestHandler {
  static async count(): Promise<number> {
    return await BCMSRepo.apiKey.count();
  }
  static async getAll(): Promise<BCMSApiKey[]> {
    return await BCMSRepo.apiKey.findAll();
  }
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSApiKeyAddData;
  }): Promise<BCMSApiKey> {
    const rewriteResult = BCMSFactory.apiKey.rewriteKey(
      BCMSFactory.apiKey.create({
        userId: accessToken.payload.userId,
        name: body.name,
        desc: body.desc,
        blocked: body.blocked,
        access: body.access,
      }),
    );
    const key = await BCMSRepo.apiKey.add(rewriteResult.key);
    if (!key) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('ak003'),
      );
    }
    await BCMSSocketManager.emit.apiKey({
      apiKeyId: key._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    return key;
  }
}
