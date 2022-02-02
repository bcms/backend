import type {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSUserCustomPool,
} from '@bcms/types';
import {
  BCMSTag,
  BCMSTagCreateData,
  BCMSTagCreateDataSchema,
  BCMSTagUpdateData,
  BCMSTagUpdateDataSchema,
} from '@bcms/types/tag';
import { BCMSRouteProtection } from '@bcms/util';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTagRequestHandler } from './request-handler';

export const BCMSTagController = createController({
  name: 'Tag controller',
  path: '/api/tag',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTag[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSTagRequestHandler.getAll(),
          };
        },
      }),
      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTag[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSTagRequestHandler.getMany(ids),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTag }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSTagRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),
      getByValue: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTag }
      >({
        path: '/value/:value',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSTagRequestHandler.getByValue({
              value: request.params.value,
              errorHandler,
            }),
          };
        },
      }),
      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSTagCreateData>,
        { item: BCMSTag }
      >({
        type: 'post',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSTagCreateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSTagRequestHandler.create({
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),
      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSTagUpdateData>,
        { item: BCMSTag }
      >({
        type: 'put',
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSTagUpdateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSTagRequestHandler.update({
              accessToken,
              body,
              errorHandler,
            }),
          };
        },
      }),
      delete: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          await BCMSTagRequestHandler.delete({
            errorHandler,
            id: request.params.id,
            name,
            accessToken,
            logger,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
