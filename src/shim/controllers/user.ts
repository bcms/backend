import {
  createController,
  createControllerMethod,
  useRefreshTokenService,
} from '@becomes/purple-cheetah';
import { HTTPStatus, RefreshTokenService } from '@becomes/purple-cheetah/types';
import {
  JWTEncoding,
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { useJwt, useJwtEncoding } from '@becomes/purple-cheetah-mod-jwt';
import { BCMSConfig } from '@bcms/config';
import { BCMSShimService } from '..';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSRepo } from '@bcms/repo';
import { BCMSFactory } from '@bcms/factory';
import type { BCMSCloudUser } from '@bcms/types/shim';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSSocketEventType } from '@bcms/types';
import { BCMSRouteProtection } from '@bcms/util';
import { bcmsCreateDocObject } from '@bcms/doc';

export const BCMSShimUserController = createController<{
  refreshTokenService: RefreshTokenService;
  jwtManager: JWTManager;
  jwtEncoder: JWTEncoding;
}>({
  name: 'Shim user',
  path: '/api/shim/user',
  setup() {
    return {
      refreshTokenService: useRefreshTokenService(),
      jwtManager: useJwt(),
      jwtEncoder: useJwtEncoding(),
    };
  },
  methods({ refreshTokenService, jwtManager, jwtEncoder }) {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get Shim users.',
          ignore: true,
          response: {},
        }),
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ errorHandler }) {
          return await BCMSShimService.send({
            uri: '/instance/user/all',
            payload: {},
            errorHandler,
          });
        },
      }),

      verifyOtp: createControllerMethod<
        unknown,
        { accessToken: string; refreshToken: string }
      >({
        path: '/verify/otp',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Login user with OTP',
          body: {
            jsonSchema: {
              otp: {
                __type: 'string',
                __required: true,
              },
            },
          },
          response: {
            jsonSchema: {
              accessToken: {
                __type: 'string',
                __required: true,
              },
              refreshToken: {
                __type: 'string',
                __required: true,
              },
            },
          },
        }),
        async handler({ request, errorHandler }) {
          const result: {
            ok: boolean;
            user?: BCMSCloudUser;
          } = await BCMSShimService.send({
            uri: `/instance/user/verify/otp${
              request.query.user ? '?user=true' : ''
            }`,
            payload: { otp: request.body.otp },
            errorHandler,
          });
          if (!result.user) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('a003'),
            );
          }
          const cloudUsers = (
            await BCMSShimService.send<
              {
                users: BCMSCloudUser[];
              },
              unknown
            >({
              uri: '/instance/user/all',
              payload: {},
              errorHandler,
            })
          ).users;
          const users = await BCMSRepo.user.findAll();
          const usersToRemove: string[] = [];
          for (let i = 0; i < users.length; i++) {
            const usr = users[i];
            if (!cloudUsers.find((e) => e._id === usr._id)) {
              usersToRemove.push(usr._id);
            }
          }
          await BCMSRepo.user.deleteAllById(usersToRemove);
          for (let i = 0; i < cloudUsers.length; i++) {
            const cloudUser = cloudUsers[i];
            const usr = await BCMSRepo.user.findById(cloudUser._id);
            if (usr) {
              await BCMSRepo.user.update(
                BCMSFactory.user.cloudUserToUser(
                  cloudUser,
                  usr.customPool.policy,
                ),
              );
            } else {
              await BCMSRepo.user.add(
                BCMSFactory.user.cloudUserToUser(cloudUser),
              );
            }
            // TODO: Trigger socket event
            BCMSSocketManager.emit.user({
              type: BCMSSocketEventType.UPDATE,
              userId: cloudUser._id,
              userIds: 'all',
            });
          }
          let user = await BCMSRepo.user.findById(result.user._id);
          user = BCMSFactory.user.cloudUserToUser(
            result.user,
            user ? user.customPool.policy : undefined,
          );
          const accessToken = jwtManager.create({
            userId: user._id,
            roles: user.roles,
            props: user.customPool,
            issuer: BCMSConfig.jwt.scope,
          });
          if (accessToken instanceof JWTError) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              'Failed to create access token',
            );
          }
          return {
            accessToken: jwtEncoder.encode(accessToken),
            refreshToken: refreshTokenService.create(user._id),
          };
        },
      }),
    };
  },
});
