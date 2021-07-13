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
import { useBcmsLanguageFactory } from './factory';
import { useBcmsLanguageRepository } from './repository';
import {
  BCMSLanguageAddData,
  BCMSLanguageAddDataSchema,
  BCMSLanguageFactory,
  BCMSLanguageRepository,
  BCMSResponseCode,
  BCMSUserCustomPool,
} from '../types';
import { useBcmsResponseCode } from '../response-code';

interface Setup {
  langRepo: BCMSLanguageRepository;
  resCode: BCMSResponseCode;
  langFactory: BCMSLanguageFactory;
}

export const BCMSLanguageController = createController<Setup>({
  path: '/api/language',
  name: 'Language controller',
  setup() {
    return {
      langRepo: useBcmsLanguageRepository(),
      resCode: useBcmsResponseCode(),
      langFactory: useBcmsLanguageFactory(),
    };
  },
  methods({ langRepo, resCode, langFactory }) {
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
            items: await langRepo.findAll(),
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
            count: await langRepo.count(),
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
          const lang = await langRepo.findById(request.params.id);
          if (!lang) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('lng001', { id: request.params.id }),
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
          const language = langFactory.create({
            name: body.name,
            code: body.code,
            nativeName: body.nativeName,
            def: false,
            userId: accessToken.payload.userId,
          });
          if (await langRepo.methods.findByCode(language.code)) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('lng002', { code: language.code }),
            );
          }
          const addedLanguage = await langRepo.add(language as never);
          if (!addedLanguage) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('lng003'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            item: language,
          };
        },
      }),

      // TODO: Update language
      // update: createControllerMethod({
      //   type: 'put',
      //   preRequestHandler: createJwtAndBodyCheckRouteProtection<
      //     BCMSUserCustomPool,
      //     BCMSLanguageUpdateData
      //   >({
      //     roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
      //     permissionName: JWTPermissionName.WRITE,
      //     bodySchema: BCMSLanguageUpdateDataSchema,
      //   }),
      //   async handler({ errorHandler, body }) {
      //     const lang = await langRepo.findById(body._id);
      //     if (!lang) {
      //       throw errorHandler.occurred(
      //         HTTPStatus.NOT_FOUNT,
      //         resCode.get('lng001', { id: body._id }),
      //       );
      //     }
      //   },
      // }),

      deleteById: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.DELETE,
          ),
        async handler({ request, errorHandler }) {
          const lang = await langRepo.findById(request.params.id);
          if (!lang) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('lng001', { id: request.params.id }),
            );
          }
          const deleteResult = await langRepo.deleteById(request.params.id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('lng006'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
