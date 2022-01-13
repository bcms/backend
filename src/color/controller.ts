import {
  BCMSColor,
  BCMSColorCreateData,
  BCMSColorCreateDataSchema,
  BCMSColorUpdateData,
  BCMSColorUpdateDataSchema,
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSUserCustomPool,
} from '@bcms/types';
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
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { BCMSColorRequestHandler } from './request-handler';

export const BCMSColorController = createController({
  name: 'Color controller',
  path: '/api/color',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSColor[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSColorRequestHandler.getAll(),
          };
        },
      }),
      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSColor[] }
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
            items: await BCMSColorRequestHandler.getMany(ids),
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
            count: await BCMSColorRequestHandler.count(),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSColor }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSColorRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),
      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSColorCreateData>,
        { item: BCMSColor }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSColorCreateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSColorRequestHandler.create({
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),
      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSColorUpdateData>,
        { item: BCMSColor }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSColorUpdateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSColorRequestHandler.update({
              errorHandler,
              body,
              accessToken,
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
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken }) {
          await BCMSColorRequestHandler.delete({
            id: request.params.id,
            errorHandler,
            accessToken,
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
