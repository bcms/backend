import {
  createController,
  createControllerMethod,
  createJwtProtectionPreRequestHandler,
  useObjectUtility,
  useSocket,
} from '@becomes/purple-cheetah';
import {
  HTTPStatus,
  JWT,
  JWTPermissionName,
  JWTRoleName,
  ObjectUtility,
  ObjectUtilityError,
  Socket,
} from '@becomes/purple-cheetah/types';
import { useUserRepo } from './repository';
import {
  JWTProps,
  ProtectedUser,
  ResponseCode,
  UpdateUserData,
  UserFSDB,
  UserMongoDB,
  UserRepository,
  UpdateUserDataSchema,
} from '../types';
import { UserFactory } from './factory';
import { useResponseCode } from '../response-code';

export const UserController = createController<{
  repo: UserRepository;
  resCode: ResponseCode;
  objectUtil: ObjectUtility;
  socket: Socket;
}>({
  name: 'User controller',
  path: '/api/user',
  setup() {
    return {
      repo: useUserRepo(),
      resCode: useResponseCode(),
      objectUtil: useObjectUtility(),
      socket: useSocket(),
    };
  },
  methods({ repo, resCode, objectUtil }) {
    return {
      count: createControllerMethod<unknown, { count: number }>({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<JWTProps>(
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
        preRequestHandler: createJwtProtectionPreRequestHandler<JWTProps>(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: (await repo.findAll()).map((e) => {
              return UserFactory.toProtected(e);
            }),
          };
        },
      }),
      get: createControllerMethod<
        { accessToken: JWT<JWTProps> },
        { item: ProtectedUser }
      >({
        path: '',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<JWTProps>(
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
            item: UserFactory.toProtected(user),
          };
        },
      }),
      getById: createControllerMethod<unknown, { item: ProtectedUser }>({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler<JWTProps>(
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
            item: UserFactory.toProtected(user),
          };
        },
      }),
      update: createControllerMethod<
        { accessToken: JWT<JWTProps> },
        { item: ProtectedUser }
      >({
        path: '',
        type: 'put',
        preRequestHandler: createJwtProtectionPreRequestHandler<JWTProps>(
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
            item: UserFactory.toProtected(updatedUser),
          };
        },
      }),
    };
  },
});
