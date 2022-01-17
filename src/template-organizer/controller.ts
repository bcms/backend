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
import {
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerCreateDataSchema,
  BCMSTemplateOrganizerUpdateData,
  BCMSTemplateOrganizerUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { BCMSTemplateOrganizerRequestHandler } from './request-handler';

export const BCMSTemplateOrganizerController = createController({
  name: 'Template organizer controller',
  path: '/api/template/organizer',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplateOrganizer[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSTemplateOrganizerRequestHandler.getAll(),
          };
        },
      }),
      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplateOrganizer[] }
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
            items: await BCMSTemplateOrganizerRequestHandler.getMany(ids),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTemplateOrganizer }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSTemplateOrganizerRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),
      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateOrganizerCreateData>,
        { item: BCMSTemplateOrganizer }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          bodySchema: BCMSTemplateOrganizerCreateDataSchema,
          permissionName: JWTPermissionName.WRITE,
          roleNames: [JWTRoleName.ADMIN],
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSTemplateOrganizerRequestHandler.create({
              errorHandler,
              body,
              accessToken,
            }),
          };
        },
      }),
      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateOrganizerUpdateData>,
        { item: BCMSTemplateOrganizer }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          bodySchema: BCMSTemplateOrganizerUpdateDataSchema,
          permissionName: JWTPermissionName.WRITE,
          roleNames: [JWTRoleName.ADMIN],
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSTemplateOrganizerRequestHandler.update({
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
        async handler({ request, errorHandler, accessToken }) {
          await BCMSTemplateOrganizerRequestHandler.delete({
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
