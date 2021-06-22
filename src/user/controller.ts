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
  ProtectedUser,
  ResponseCode,
  UpdateUserData,
  UserFSDB,
  UserMongoDB,
  UserRepository,
  UpdateUserDataSchema,
  UserFactory,
  UserCustomPool,
} from '../types';
import { useResponseCode } from '../response-code';
import { useUserFactory } from './factory';
import type { Socket } from '@becomes/purple-cheetah-mod-socket/types';
import { useSocket } from '@becomes/purple-cheetah-mod-socket';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

interface Setup {
  repo: UserRepository;
  resCode: ResponseCode;
  objectUtil: ObjectUtility;
  socket: Socket;
  userFactory: UserFactory;
}

export const UserController = createController<Setup>({
  name: 'User controller',
  path: '/api/user',
  setup() {
    return {
      repo: useUserRepository(),
      resCode: useResponseCode(),
      objectUtil: useObjectUtility(),
      socket: useSocket(),
      userFactory: useUserFactory(),
    };
  },
  methods({ repo, resCode, objectUtil, userFactory }) {
    return {
      count: createControllerMethod<unknown, { count: number }>({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<UserCustomPool>(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await repo.count(),
          };
        },
      }),
      getAll: createControllerMethod<unknown, { items: ProtectedUser[] }>({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<UserCustomPool>(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: (await repo.findAll()).map((e) => {
              return userFactory.toProtected(e);
            }),
          };
        },
      }),
      get: createControllerMethod<
        { accessToken: JWT<UserCustomPool> },
        { item: ProtectedUser }
      >({
        path: '',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<UserCustomPool>(
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
      getById: createControllerMethod<unknown, { item: ProtectedUser }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<UserCustomPool>(
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
        { accessToken: JWT<UserCustomPool> },
        { item: ProtectedUser }
      >({
        path: '',
        type: 'put',
        preRequestHandler: createJwtProtectionPreRequestHandler<UserCustomPool>(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler, accessToken }) {
          const data: UpdateUserData = request.body;
          {
            const checkBody = objectUtil.compareWithSchema(
              request.body,
              UpdateUserDataSchema,
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
              if (typeof data.customPool.policy.customPortal !== 'undefined') {
                change = true;
                user.customPool.policy.customPortal =
                  data.customPool.policy.customPortal;
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
              if (typeof data.customPool.policy.webhooks !== 'undefined') {
                change = true;
                user.customPool.policy.webhooks =
                  data.customPool.policy.webhooks;
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
          const updatedUser = await repo.update(user as UserFSDB & UserMongoDB);
          return {
            item: userFactory.toProtected(updatedUser),
          };
        },
      }),
    };
  },
});
