import {
  createController,
  createControllerMethod,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import { createBcmsApiKeySecurityPreRequestHandler } from '../security';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
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
  BCMSJWTAndBodyCheckerRouteProtectionResult,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { useBcmsFunctionManger } from '@bcms/function';
import { createJwtAndBodyCheckRouteProtection } from '@bcms/util';
import { BCMSApiKeyRequestHandler } from './request-handler';

interface Setup {
  objectUtil: ObjectUtility;
  functionManager: BCMSFunctionManager;
}

export const BCMSApiKeyController = createController<Setup>({
  name: 'Api key controller',
  path: '/api/key',
  setup() {
    return {
      objectUtil: useObjectUtility(),
      functionManager: useBcmsFunctionManger(),
    };
  },
  methods({ functionManager }) {
    return {
      getAccessList: createControllerMethod({
        path: '/access/list',
        type: 'get',
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
          while (i < apiKey.access.templates.length) {
            const tempAccess = apiKey.access.templates[i];
            if (!templates.find((e) => e._id === tempAccess._id)) {
              apiKey.access.templates.splice(i, 1);
            } else {
              i++;
            }
          }
          return apiKey.access;
        },
      }),

      count: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSApiKey[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSApiKeyAddData>,
        { item: BCMSApiKey }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSApiKeyAddDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          {
            return {
              item: await BCMSApiKeyRequestHandler.create({
                accessToken,
                errorHandler,
                body,
              }),
            };
          }
        },
      }),

      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSApiKeyUpdateData>,
        { item: BCMSApiKey }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSApiKeyUpdateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          return {
            item: await BCMSApiKeyRequestHandler.update({
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
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken }) {
          await BCMSApiKeyRequestHandler.delete({
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
