import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
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
import {
  createJwtProtectionPreRequestHandler,
  useJwt,
  useJwtEncoding,
} from '@becomes/purple-cheetah-mod-jwt';
import { BCMSConfig } from '@bcms/config';
import { BCMSShimService } from '..';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSRepo } from '@bcms/repo';
import { BCMSFactory } from '@bcms/factory';
import type { BCMSCloudUser } from '@bcms/types/shim';

export const BCMSShimUserController = createController<{
  refreshTokenService: RefreshTokenService;
  jwtManager: JWTManager;
  jwtEncoder: JWTEncoding;
}>({
  name: 'Shim user controller',
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
        preRequestHandler: createJwtProtectionPreRequestHandler(
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
        async handler({ request, errorHandler }) {
          const result: {
            ok: boolean;
            user?: BCMSCloudUser;
          } = await BCMSShimService.send({
            uri: '/instance/user/verify/otp',
            payload: { otp: request.body.otp },
            errorHandler,
          });
          if (!result.user) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('a003'),
            );
          }
          let user = await BCMSRepo.user.findById(result.user._id);
          let createUser = false;
          if (!user) {
            createUser = true;
            if (result.user.roles[0].name === JWTRoleName.ADMIN) {
              user = BCMSFactory.user.create({
                admin: true,
                options: {
                  email: result.user.email,
                  avatarUri: '',
                  firstName: result.user.personal.firstName,
                  lastName: result.user.personal.lastName,
                },
              });
            } else {
              user = BCMSFactory.user.create({
                admin: false,
                options: {
                  email: result.user.email,
                  avatarUri: '',
                  firstName: result.user.personal.firstName,
                  lastName: result.user.personal.lastName,
                },
              });
            }
          }
          if (BCMSConfig.database.fs) {
            user._id = result.user._id;
          } else {
            user._id = new Types.ObjectId(result.user._id);
          }
          user.password = await bcrypt.hash(
            crypto.randomBytes(64).toString(),
            10,
          );
          if (createUser) {
            user = await BCMSRepo.user.add(user as never);
            if (!user) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add user to the database.',
              );
            }
            // TODO: Trigger socket event
          }
          const accessToken = jwtManager.create({
            userId: `${user._id}`,
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
            refreshToken: refreshTokenService.create(`${user._id}`),
          };
        },
      }),
    };
  },
});
