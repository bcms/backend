import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import {
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSLanguage,
  BCMSLanguageAddData,
  BCMSLanguageAddDataSchema,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSLanguageRequestHandler } from './request-handler';

export const BCMSLanguageController = createController({
  path: '/api/language',
  name: 'Language controller',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSLanguage[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSRepo.language.findAll(),
          };
        },
      }),

      count: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSRepo.language.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSLanguage }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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

      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSLanguageAddData>,
        { item: BCMSLanguage }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSLanguageAddDataSchema,
        }),
        async handler({ body, accessToken, errorHandler }) {
          return {
            item: await BCMSLanguageRequestHandler.create({
              body,
              accessToken,
              errorHandler,
            }),
          };
        },
      }),

      deleteById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
            languageId: lang._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('language');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
