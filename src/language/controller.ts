import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSRouteProtection } from '../util';
import {
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSLanguage,
  BCMSLanguageAddData,
  BCMSLanguageAddDataSchema,
  BCMSRouteProtectionJwtResult,
} from '../types';
import { BCMSLanguageRequestHandler } from './request-handler';
import { bcmsCreateDocObject } from '@bcms/doc';

export const BCMSLanguageController = createController({
  path: '/api/language',
  name: 'Language controller',
  methods() {
    return {
      getAll: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { items: BCMSLanguage[] }
      >({
        path: '/all',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all languages',
          security: ['AccessToken'],
          response: {
            json: 'BCMSLanguageItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSLanguageRequestHandler.getAll(),
          };
        },
      }),

      count: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get number of languages',
          security: ['AccessToken'],
          response: {
            jsonSchema: {
              count: {
                __type: 'number',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSLanguageRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { item: BCMSLanguage }
      >({
        path: '/:id',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get language by ID',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
              description: 'Language ID',
            },
          ],
          response: {
            json: 'BCMSLanguageItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSLanguageRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSLanguageAddData>,
        { item: BCMSLanguage }
      >({
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Create a new language',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Connection socket ID',
            },
          ],
          response: {
            json: 'BCMSLanguageItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSLanguageAddDataSchema,
          }),
        async handler({ body, accessToken, errorHandler, request }) {
          return {
            item: await BCMSLanguageRequestHandler.create({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              accessToken,
              errorHandler,
            }),
          };
        },
      }),

      deleteById: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        doc: bcmsCreateDocObject({
          summary: 'Delete existing language',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
              description: 'Language ID',
            },
            {
              name: 'X-Bcms-Sid',
              required: true,
              type: 'header',
              description: 'Connection socket ID',
            },
          ],
          response: {
            jsonSchema: {
              message: {
                __type: 'string',
                __required: true,
              },
            },
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken }) {
          await BCMSLanguageRequestHandler.delete({
            sid: request.headers['x-bcms-sid'] as string,
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
