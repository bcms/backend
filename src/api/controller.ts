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
import {
  HTTPStatus,
  ObjectUtility,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import {
  BCMSApiKeyAddData,
  BCMSApiKeyAddDataSchema,
  BCMSApiKeyUpdateData,
  BCMSApiKeyUpdateDataSchema,
  BCMSSocketEventType,
  BCMSUserCustomPool,
  BCMSApiKey,
  BCMSFunctionManager,
  BCMSJWTAndBodyCheckerRouteProtectionResult,
} from '../types';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
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
  methods({ objectUtil, functionManager }) {
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
          const key = await BCMSRepo.apiKey.findById(request.params.id);
          if (!key) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('ak001', { id: request.params.id }),
            );
          }
          return { item: key };
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
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSApiKey }
      >({
        type: 'put',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN],
          JWTPermissionName.WRITE,
        ),
        async handler({ request, errorHandler, accessToken }) {
          const data: BCMSApiKeyUpdateData = request.body;
          {
            const checkBody = objectUtil.compareWithSchema(
              data,
              BCMSApiKeyUpdateDataSchema,
              'body',
            );
            if (checkBody instanceof ObjectUtilityError) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('g002'),
              );
            }
          }
          const key = await BCMSRepo.apiKey.findById(data._id);
          if (!key) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('ak001', { id: data._id }),
            );
          }
          let changeDetected = false;
          if (typeof data.name !== 'undefined' && data.name !== key.name) {
            changeDetected = true;
            key.name = data.name;
          }
          if (typeof data.desc !== 'undefined' && data.desc !== key.desc) {
            changeDetected = true;
            key.desc = data.desc;
          }
          if (
            typeof data.blocked !== 'undefined' &&
            data.blocked !== key.blocked
          ) {
            changeDetected = true;
            key.blocked = data.blocked;
          }
          if (typeof data.access !== 'undefined') {
            changeDetected = true;
            key.access = data.access;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('g003'),
            );
          }
          const updatedKey = await BCMSRepo.apiKey.update(key);
          if (!updatedKey) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('ak005'),
            );
          }
          await BCMSSocketManager.emit.apiKey({
            apiKeyId: updatedKey._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return { item: updatedKey };
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
          const key = await BCMSRepo.apiKey.findById(request.params.id);
          if (!key) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('ak001', { id: request.params.id }),
            );
          }
          if (!(await BCMSRepo.apiKey.deleteById(request.params.id))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('ak006'),
            );
          }
          await BCMSSocketManager.emit.apiKey({
            apiKeyId: key._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
