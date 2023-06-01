import {
  BCMSColor,
  BCMSColorCreateData,
  BCMSColorCreateDataSchema,
  BCMSColorUpdateData,
  BCMSColorUpdateDataSchema,
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSRouteProtectionJwtResult,
} from '@bcms/types';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSRouteProtection } from '../util';
import { BCMSColorRequestHandler } from './request-handler';
import { bcmsCreateDocObject } from '@bcms/doc';

export const BCMSColorController = createController({
  name: 'Color',
  path: '/api/color',
  methods() {
    return {
      getAll: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { items: BCMSColor[] }
      >({
        path: '/all',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all colors',
          security: ['AccessToken'],
          response: {
            json: 'BCMSColorItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtResult,
        { items: BCMSColor[] }
      >({
        path: '/many',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get colors by ID',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Ids',
              type: 'header',
              required: true,
              description: 'Color IDs (ex. `id1-id2-id3.....`)',
            },
          ],
          response: {
            json: 'BCMSColorItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get colors count',
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
            count: await BCMSColorRequestHandler.count(),
          };
        },
      }),

      getById: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { item: BCMSColor }
      >({
        path: '/:id',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get color by ID',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
            },
          ],
          response: {
            json: 'BCMSColorItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSColorCreateData>,
        { item: BCMSColor }
      >({
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Create a new color',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              type: 'header',
              description: 'Connection socket ID',
              required: true,
            },
          ],
          body: {
            json: 'BCMSColorCreateData',
          },
          response: {
            json: 'BCMSColorItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSColorCreateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSColorRequestHandler.create({
              sid: request.headers['x-bcms-sid'] as string,
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSColorUpdateData>,
        { item: BCMSColor }
      >({
        type: 'put',
        doc: bcmsCreateDocObject({
          summary: 'Create an existing color',
          security: ['AccessToken'],
          params: [
            {
              name: 'X-Bcms-Sid',
              type: 'header',
              description: 'Connection socket ID',
              required: true,
            },
          ],
          body: {
            json: 'BCMSColorUpdateData',
          },
          response: {
            json: 'BCMSColorItem',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSColorUpdateDataSchema,
          }),
        async handler({ errorHandler, body, accessToken, request }) {
          return {
            item: await BCMSColorRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              errorHandler,
              body,
              accessToken,
            }),
          };
        },
      }),

      delete: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        doc: bcmsCreateDocObject({
          summary: 'Delete color by ID',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
            },
            {
              name: 'X-Bcms-Sid',
              type: 'header',
              description: 'Connection socket ID',
              required: true,
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
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken }) {
          await BCMSColorRequestHandler.delete({
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
