import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSLanguage,
  BCMSLanguageAddData,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPError, HTTPStatus } from '@becomes/purple-cheetah/types';

export class BCMSLanguageRequestHandler {
  static async create({
    accessToken,
    errorHandler,
    body,
  }: {
    accessToken: JWT<BCMSUserCustomPool>;
    errorHandler: HTTPError;
    body: BCMSLanguageAddData;
  }): Promise<BCMSLanguage> {
    const language = BCMSFactory.language.create({
      name: body.name,
      code: body.code,
      nativeName: body.nativeName,
      def: false,
      userId: accessToken.payload.userId,
    });
    if (await BCMSRepo.language.methods.findByCode(language.code)) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        bcmsResCode('lng002', { code: language.code }),
      );
    }
    const addedLanguage = await BCMSRepo.language.add(language);
    if (!addedLanguage) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        bcmsResCode('lng003'),
      );
    }
    await BCMSSocketManager.emit.language({
      languageId: addedLanguage._id,
      type: BCMSSocketEventType.UPDATE,
      userIds: 'all',
      excludeUserId: [accessToken.payload.userId],
    });
    await BCMSRepo.change.methods.updateAndIncByName('language');
    return addedLanguage;
  }
}
