import {
  createController,
  createControllerMethod,
  useObjectUtility,
} from '@becomes/purple-cheetah';
import {
  HTTPStatus,
  ObjectUtility,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import { useUserRepository } from './repository';
import {
  BCMSProtectedUser,
  BCMSUserFSDB,
  BCMSUserMongoDB,
  BCMSUserRepository,
  BCMSUserFactory,
  BCMSUserCustomPool,
  BCMSUserUpdateDataSchema,
  BCMSUserUpdateData,
  BCMSUser,
  BCMSResponseCode,
  BCMSSocketManager,
  BCMSSocketEventType,
} from '../types';
import { useUserFactory } from './factory';
import type { Socket } from '@becomes/purple-cheetah-mod-socket/types';
import { useSocket } from '@becomes/purple-cheetah-mod-socket';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { useBcmsResponseCode } from '../response-code';
import { useBcmsSocketManager } from '../socket';

interface Setup {
  repo: BCMSUserRepository;
  resCode: BCMSResponseCode;
  objectUtil: ObjectUtility;
  socket: BCMSSocketManager;
  userFactory: BCMSUserFactory;
}

export const BCMSUserController = createController<Setup>({
  name: 'User controller',
  path: '/api/user',
  setup() {
    return {
      repo: useUserRepository(),
      resCode: useBcmsResponseCode(),
      objectUtil: useObjectUtility(),
      socket: useBcmsSocketManager(),
      userFactory: useUserFactory(),
    };
  },
  methods({ repo, resCode, objectUtil, userFactory, socket }) {
    return {
      count: createControllerMethod<unknown, { count: number }>({
        path: '/count',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            count: await repo.count(),
          };
        },
      }),
      getAll: createControllerMethod<unknown, { items: BCMSProtectedUser[] }>({
        path: '/all',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: (await repo.findAll()).map((e: BCMSUser) => {
              return userFactory.toProtected(e);
            }),
          };
        },
      }),
      get: createControllerMethod<
        { accessToken: JWT<BCMSUserCustomPool> },
        { item: BCMSProtectedUser }
      >({
        path: '',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ accessToken, errorHandler }) {
          const user = await repo.findById(accessToken.payload.userId);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('u001'),
            );
          }
          return {
            item: userFactory.toProtected(user),
          };
        },
      }),
      getById: createControllerMethod<unknown, { item: BCMSProtectedUser }>({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const user = await repo.findById(request.params.id);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('g002', { id: request.params.id }),
            );
          }
          return {
            item: userFactory.toProtected(user),
          };
        },
      }),
      update: createControllerMethod<
        { accessToken: JWT<BCMSUserCustomPool> },
        { item: BCMSProtectedUser }
      >({
        path: '',
        type: 'put',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler, accessToken }) {
          const data: BCMSUserUpdateData = request.body;
          {
            const checkBody = objectUtil.compareWithSchema(
              request.body,
              BCMSUserUpdateDataSchema,
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
          }
          if (
            accessToken.payload.userId !== data._id &&
            !accessToken.payload.rls.find(
              (role) => role.name === JWTRoleName.ADMIN,
            )
          ) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('u003'),
            );
          }
          const user = await repo.findById(data._id);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('u002', { id: request.params.id }),
            );
          }
          let change = false;
          if (typeof data.customPool !== 'undefined') {
            if (typeof data.customPool.policy !== 'undefined') {
              if (
                !accessToken.payload.rls.find(
                  (role) => role.name === JWTRoleName.ADMIN,
                )
              ) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  resCode.get('u008'),
                );
              }
              if (typeof data.customPool.policy.templates !== 'undefined') {
                change = true;
                user.customPool.policy.templates =
                  data.customPool.policy.templates;
              }
              if (typeof data.customPool.policy.media !== 'undefined') {
                change = true;
                user.customPool.policy.media = data.customPool.policy.media;
              }
              if (typeof data.customPool.policy.plugins !== 'undefined') {
                change = true;
                user.customPool.policy.plugins = data.customPool.policy.plugins;
              }
            }
          }
          if (!change) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              resCode.get('g003'),
            );
          }
          const updatedUser = await repo.update(
            user as BCMSUserFSDB & BCMSUserMongoDB,
          );
          await socket.emit.user({
            userId: `${updatedUser._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: userFactory.toProtected(updatedUser),
          };
        },
      }),
    };
  },
});
