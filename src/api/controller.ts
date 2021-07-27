import {
  createController,
  createControllerMethod,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import { useBcmsApiKeyRepository } from './repository';
import { createBcmsApiKeySecurityPreRequestHandler } from '../security';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { useBcmsResponseCode } from '../response-code';
import {
  HTTPStatus,
  ObjectUtility,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import { useBcmsApiKeyFactory } from './factory';
import {
  BCMSApiKeyAddData,
  BCMSApiKeyAddDataSchema,
  BCMSApiKeyFactory,
  BCMSApiKeyRepository,
  BCMSApiKeyUpdateData,
  BCMSApiKeyUpdateDataSchema,
  BCMSResponseCode,
  BCMSSocketEventType,
  BCMSSocketManager,
  BCMSUserCustomPool,
} from '../types';
import { useBcmsSocketManager } from '../socket';

interface Setup {
  repo: BCMSApiKeyRepository;
  resCode: BCMSResponseCode;
  objectUtil: ObjectUtility;
  apiKeyFactory: BCMSApiKeyFactory;
  socket: BCMSSocketManager;
}

export const BCMSApiKeyController = createController<Setup>({
  name: 'Api key controller',
  path: '/api/key',
  setup() {
    return {
      repo: useBcmsApiKeyRepository(),
      resCode: useBcmsResponseCode(),
      objectUtil: useObjectUtility(),
      apiKeyFactory: useBcmsApiKeyFactory(),
      socket: useBcmsSocketManager(),
    };
  },
  methods({ repo, resCode, objectUtil, apiKeyFactory, socket }) {
    return {
      getAccessList: createControllerMethod({
        path: '/access/list',
        type: 'get',
        preRequestHandler: createBcmsApiKeySecurityPreRequestHandler(),
        async handler({ apiKey }) {
          return apiKey.access;
        },
      }),

      count: createControllerMethod({
        path: '/count',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.READ,
          ),
        async handler() {
          return await repo.count();
        },
      }),

      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.READ,
          ),
        async handler() {
          return await repo.findAll();
        },
      }),

      getById: createControllerMethod({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const key = await repo.findById(request.params.id);
          if (!key) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('ak001', { id: request.params.id }),
            );
          }
          return key;
        },
      }),

      create: createControllerMethod({
        type: 'post',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.WRITE,
          ),
        async handler({ request, errorHandler, accessToken }) {
          {
            const data: BCMSApiKeyAddData = request.body;
            const checkBody = objectUtil.compareWithSchema(
              data,
              BCMSApiKeyAddDataSchema,
              'body',
            );
            if (checkBody instanceof ObjectUtilityError) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                resCode.get('g002', {
                  msg: checkBody.message,
                }),
              );
            }
            const rewriteResult = apiKeyFactory.rewriteKey(
              apiKeyFactory.create({
                userId: accessToken.payload.userId,
                name: data.name,
                desc: data.desc,
                blocked: data.blocked,
                access: data.access,
              }),
            );
            const key = await repo.add(rewriteResult.key as never);
            if (!key) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                resCode.get('ak003'),
              );
            }
            await socket.emit.apiKey({
              apiKeyId: `${key._id}`,
              type: BCMSSocketEventType.UPDATE,
              userIds: 'all',
              excludeUserId: [accessToken.payload.userId],
            });
            return key;
          }
        },
      }),

      update: createControllerMethod({
        type: 'put',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
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
                resCode.get('g002'),
              );
            }
          }
          const key = await repo.findById(data._id);
          if (!key) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('ak001', { id: data._id }),
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
              resCode.get('g003'),
            );
          }
          const updatedKey = await repo.update(key as never);
          if (!updatedKey) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('ak005'),
            );
          }
          await socket.emit.apiKey({
            apiKeyId: `${updatedKey._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return updatedKey;
        },
      }),

      delete: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.DELETE,
          ),
        async handler({ request, errorHandler, accessToken }) {
          const key = await repo.findById(request.params.id);
          if (!key) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('ak001', { id: request.params.id }),
            );
          }
          if (!(await repo.deleteById(request.params.id))) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('ak006'),
            );
          }
          await socket.emit.apiKey({
            apiKeyId: `${key._id}`,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
        },
      }),
    };
  },
});
