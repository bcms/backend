import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, StringUtility } from '@becomes/purple-cheetah/types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import {
  BCMSApiKey,
  BCMSUserCustomPool,
  BCMSTemplateCreateData,
  BCMSTemplateCreateDataSchema,
  BCMSTemplateUpdateData,
  BCMSTemplateUpdateDataSchema,
  BCMSSocketEventType,
  BCMSTemplate,
  BCMSJWTAndBodyCheckerRouteProtectionResult,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSPropHandler } from '@bcms/prop';
import { BCMSTemplateRequestHandler } from './request-handler';

interface Setup {
  stringUtil: StringUtility;
}

export const BCMSTemplateController = createController<Setup>({
  name: 'Template controller',
  path: '/api/template',
  setup() {
    return {
      stringUtil: useStringUtility(),
    };
  },
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplate[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSTemplateRequestHandler.getAll(),
          };
        },
      }),

      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplate[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSTemplateRequestHandler.getMany(ids),
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
            count: await BCMSTemplateRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTemplate }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSTemplateRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateCreateData>,
        { item: BCMSTemplate }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSTemplateCreateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          return {
            item: await BCMSTemplateRequestHandler.create({
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateUpdateData>,
        { item: BCMSTemplate }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSTemplateUpdateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          return {
            item: await BCMSTemplateRequestHandler.update({
              accessToken,
              errorHandler,
              body,
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
        async handler({ request, errorHandler, logger, name, accessToken }) {
          const id = request.params.id;
          const template = await BCMSRepo.template.findById(id);
          if (!template) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tmp001', { id }),
            );
          }
          const deleteResult = await BCMSRepo.template.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tmp006'),
            );
          }
          await BCMSRepo.entry.methods.deleteAllByTemplateId(id);
          const errors = await BCMSPropHandler.removeEntryPointer({
            templateId: id,
          });
          if (errors) {
            logger.error(name, errors);
          }

          const keys = await BCMSRepo.apiKey.findAll();
          const updateKeys: BCMSApiKey[] = [];
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key.access.templates.find((e) => e._id === template._id)) {
              key.access.templates = key.access.templates.filter(
                (e) => e._id !== template._id,
              );
              updateKeys.push(key);
            }
          }
          for (let i = 0; i < updateKeys.length; i++) {
            const key = updateKeys[i];
            await BCMSRepo.apiKey.update(key);
            await BCMSSocketManager.emit.apiKey({
              apiKeyId: key._id,
              type: BCMSSocketEventType.UPDATE,
              userIds: 'all',
            });
          }
          await BCMSSocketManager.emit.template({
            templateId: template._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('templates');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
