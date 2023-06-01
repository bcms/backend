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
import {
  BCMSProtectedUser,
  BCMSUserUpdateDataSchema,
  BCMSUserUpdateData,
  BCMSUser,
  BCMSSocketEventType,
  BCMSEventConfigScope,
  BCMSEventConfigMethod,
  BCMSRouteProtectionJwtResult,
} from '../types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSRepo } from '@bcms/repo';
import { BCMSFactory } from '@bcms/factory';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSRouteProtection } from '@bcms/util';
import { BCMSEventManager } from '@bcms/event';
import { bcmsCreateDocObject } from '@bcms/doc';

interface Setup {
  objectUtil: ObjectUtility;
}

export const BCMSUserController = createController<Setup>({
  name: 'User',
  path: '/api/user',
  setup() {
    return {
      objectUtil: useObjectUtility(),
    };
  },
  methods({ objectUtil }) {
    return {
      count: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get number of users',
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
            count: await BCMSRepo.user.count(),
          };
        },
      }),

      getAll: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { items: BCMSProtectedUser[] }
      >({
        path: '/all',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get all users',
          security: ['AccessToken'],
          response: {
            json: 'BCMSProtectedUserItems',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: (await BCMSRepo.user.findAll()).map((e: BCMSUser) => {
              return BCMSFactory.user.toProtected(e);
            }),
          };
        },
      }),

      get: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { item: BCMSProtectedUser }
      >({
        path: '',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get a user by provided access token.',
          security: ['AccessToken'],
          response: {
            json: 'BCMSProtectedUserItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ accessToken, errorHandler }) {
          const user = await BCMSRepo.user.findById(accessToken.payload.userId);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('u001'),
            );
          }
          return {
            item: BCMSFactory.user.toProtected(user),
          };
        },
      }),

      getById: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { item: BCMSProtectedUser }
      >({
        path: '/:id',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get a user by ID.',
          security: ['AccessToken'],
          params: [
            {
              name: 'id',
              required: true,
              type: 'path',
              description: 'User ID',
            },
          ],
          response: {
            json: 'BCMSProtectedUserItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const user = await BCMSRepo.user.findById(request.params.id);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('g002', { id: request.params.id }),
            );
          }
          return {
            item: BCMSFactory.user.toProtected(user),
          };
        },
      }),

      update: createControllerMethod<
        BCMSRouteProtectionJwtResult,
        { item: BCMSProtectedUser }
      >({
        path: '',
        type: 'put',
        doc: bcmsCreateDocObject({
          summary: 'Update users information',
          security: ['AccessToken'],
          body: {
            json: 'BCMSUserUpdateData',
          },
          response: {
            json: 'BCMSProtectedUserItem',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
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
                bcmsResCode('g002', {
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
              bcmsResCode('u003'),
            );
          }
          const user = await BCMSRepo.user.findById(data._id);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('u002', { id: request.params.id }),
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
                  bcmsResCode('u008'),
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
              bcmsResCode('g003'),
            );
          }
          const updatedUser = await BCMSRepo.user.update(user);
          BCMSEventManager.emit(
            BCMSEventConfigScope.USER,
            BCMSEventConfigMethod.UPDATE,
            updatedUser,
          );
          const sid = request.headers['x-bcms-sid'] as string;
          await BCMSSocketManager.emit.user({
            userId: updatedUser._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId + '_' + sid],
          });
          await BCMSSocketManager.emit.refresh({
            userId: user._id,
          });
          return {
            item: BCMSFactory.user.toProtected(updatedUser),
          };
        },
      }),
    };
  },
});
