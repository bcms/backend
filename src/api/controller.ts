import {
  createController,
  createControllerMethod,
  createDocObject,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import { createBcmsApiKeySecurityPreRequestHandler } from '../security';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import type { ObjectUtility } from '@becomes/purple-cheetah/types';
import {
  BCMSApiKeyAddData,
  BCMSApiKeyAddDataSchema,
  BCMSApiKeyUpdateData,
  BCMSApiKeyUpdateDataSchema,
  BCMSUserCustomPool,
  BCMSApiKey,
  BCMSFunctionManager,
  BCMSRouteProtectionJwtAndBodyCheckResult,
  BCMSApiKeyAccess,
  BCMSRouteProtectionJwtResult,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { useBcmsFunctionManger } from '@bcms/function';
import { BCMSRouteProtection } from '@bcms/util';
import { BCMSApiKeyRequestHandler } from './request-handler';
import {
  BCMSDocComponents,
  BCMSDocSecurity,
  bcmsCreateDocObject,
} from '@bcms/doc';

interface Setup {
  objectUtil: ObjectUtility;
  functionManager: BCMSFunctionManager;
}

export const BCMSApiKeyController = createController<Setup>({
  name: 'API Key',
  path: '/api/key',
  setup() {
    return {
      objectUtil: useObjectUtility(),
      functionManager: useBcmsFunctionManger(),
    };
  },
  methods({ functionManager }) {
    return {
      getAccessList: createControllerMethod<
        { apiKey: BCMSApiKey },
        BCMSApiKeyAccess
      >({
        path: '/access/list',
        type: 'get',
        doc: createDocObject<BCMSDocComponents, BCMSDocSecurity>({
          summary: 'Get access list for specified API Key.',
          security: ['ApiKey'],
          response: {
            json: 'BCMSApiKeyAccess',
          },
        }),
        preRequestHandler: createBcmsApiKeySecurityPreRequestHandler(),
        async handler({ apiKey }) {
          const fns = functionManager.getAll();
          for (let i = 0; i < fns.length; i++) {
            const fn = fns[i];
            if (fn.config.public) {
              apiKey.access.functions.push({ name: fn.config.name });
            }
          }
          const templates = await BCMSRepo.template.findAll();
          let i = 0;
          let update = false;
          while (i < apiKey.access.templates.length) {
            const tempAccess = apiKey.access.templates[i];
            const template = templates.find((e) => e._id === tempAccess._id);
            if (!template) {
              apiKey.access.templates.splice(i, 1);
            } else {
              if (!tempAccess.name || tempAccess.name !== template.name) {
                tempAccess.name = template.name;
                update = true;
              }
              i++;
            }
          }
          if (update) {
            await BCMSRepo.apiKey.update(apiKey);
          }
          return apiKey.access;
        },
      }),

      count: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        doc: createDocObject<BCMSDocComponents, BCMSDocSecurity>({
          summary: 'Get number of API keys',
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
          [JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSApiKeyRequestHandler.count(),
          };
        },
      }),

      getAll: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { items: BCMSApiKey[] }
      >({
        path: '/all',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all API keys',
          security: ['AccessToken'],
          response: {
            json: 'BCMSApiKeyItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSApiKeyRequestHandler.getAll(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSApiKey }
      >({
        path: '/:id',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get a single API Key',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'API Key ID',
              required: true,
            },
          ],
          response: {
            json: 'BCMSApiKeyItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSApiKeyRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),

      create: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSApiKeyAddData>,
        { item: BCMSApiKey }
      >({
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Add new API Key',
          security: ['AccessToken'],
          response: {
            json: 'BCMSApiKeyItem',
          },
          body: {
            json: 'BCMSApiKeyAddData',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSApiKeyAddDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          {
            return {
              item: await BCMSApiKeyRequestHandler.create({
                sid: request.headers['x-bcms-sid'] as string,
                accessToken,
                errorHandler,
                body,
              }),
            };
          }
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtAndBodyCheckResult<BCMSApiKeyUpdateData>,
        { item: BCMSApiKey }
      >({
        type: 'put',
        doc: bcmsCreateDocObject({
          summary: 'Update existing API Key',
          security: ['AccessToken'],
          response: {
            json: 'BCMSApiKeyItem',
          },
          body: {
            json: 'BCMSApiKeyUpdateData',
          },
        }),
        preRequestHandler:
          BCMSRouteProtection.createJwtAndBodyCheckPreRequestHandler({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.WRITE,
            bodySchema: BCMSApiKeyUpdateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken, request }) {
          return {
            item: await BCMSApiKeyRequestHandler.update({
              sid: request.headers['x-bcms-sid'] as string,
              body,
              errorHandler,
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
        doc: bcmsCreateDocObject({
          summary: 'Delete an API Key',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              type: 'path',
              description: 'API Key ID',
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
          await BCMSApiKeyRequestHandler.delete({
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
