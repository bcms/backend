import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import {
  BCMSLanguageAddData,
  BCMSLanguageAddDataSchema,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSFactory } from '@bcms/factory';
import { BCMSSocketManager } from '@bcms/socket';

export const BCMSLanguageController = createController({
  path: '/api/language',
  name: 'Language controller',
  methods() {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: await BCMSRepo.language.findAll(),
          };
        },
      }),

      count: createControllerMethod({
        path: '/count',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            count: await BCMSRepo.language.count(),
          };
        },
      }),

      getById: createControllerMethod({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const lang = await BCMSRepo.language.findById(request.params.id);
          if (!lang) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('lng001', { id: request.params.id }),
            );
          }
          return {
            item: lang,
          };
        },
      }),

      create: createControllerMethod({
        type: 'post',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSLanguageAddData>({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSLanguageAddDataSchema,
          }),
        async handler({ body, accessToken, errorHandler }) {
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
          const addedLanguage = await BCMSRepo.language.add(language as never);
          if (!addedLanguage) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('lng003'),
            );
          }
          await BCMSSocketManager.emit.language({
            languageId: `${addedLanguage._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: language,
          };
        },
      }),

      deleteById: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.DELETE,
          ),
        async handler({ request, errorHandler, accessToken }) {
          const lang = await BCMSRepo.language.findById(request.params.id);
          if (!lang) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('lng001', { id: request.params.id }),
            );
          }
          const deleteResult = await BCMSRepo.language.deleteById(
            request.params.id,
          );
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('lng006'),
            );
          }
          await BCMSSocketManager.emit.language({
            languageId: `${lang._id}`,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
