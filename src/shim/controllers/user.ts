import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import {
  createController,
  createControllerMethod,
  useRefreshTokenService,
} from '@becomes/purple-cheetah';
import { HTTPStatus, RefreshTokenService } from '@becomes/purple-cheetah/types';
import { useBcmsShimService } from '../service';
import { useUserFactory, useUserRepository } from '../../user';
import { useBcmsConfig } from '../../config';
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
import type {
  BCMSConfig,
  BCMSResponseCode,
  BCMSShimInstanceUser,
  BCMSShimService,
  BCMSUserFactory,
  BCMSUserRepository,
} from '../../types';
import { useBcmsResponseCode } from '../../response-code';

export const BCMSShimUserController = createController<{
  shimService: BCMSShimService;
  resCode: BCMSResponseCode;
  userRepo: BCMSUserRepository;
  userFactory: BCMSUserFactory;
  bcmsConfig: BCMSConfig;
  refreshTokenService: RefreshTokenService;
  jwtManager: JWTManager;
  jwtEncoder: JWTEncoding;
}>({
  name: 'Shim user controller',
  path: '/api/shim/user',
  setup() {
    return {
      shimService: useBcmsShimService(),
      resCode: useBcmsResponseCode(),
      userRepo: useUserRepository(),
      userFactory: useUserFactory(),
      bcmsConfig: useBcmsConfig(),
      refreshTokenService: useRefreshTokenService(),
      jwtManager: useJwt(),
      jwtEncoder: useJwtEncoding(),
    };
  },
  methods({
    shimService,
    resCode,
    userRepo,
    userFactory,
    bcmsConfig,
    refreshTokenService,
    jwtManager,
    jwtEncoder,
  }) {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ errorHandler }) {
          return await shimService.send({
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
            user?: BCMSShimInstanceUser;
          } = await shimService.send({
            uri: '/instance/user/verify/otp',
            payload: { otp: request.body.otp },
            errorHandler,
          });
          if (!result.user) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              resCode.get('a003'),
            );
          }
          let user = await userRepo.findById(result.user._id);
          let createUser = false;
          if (!user) {
            createUser = true;
            if (result.user.roles[0].name === JWTRoleName.ADMIN) {
              user = userFactory.create({
                admin: true,
                options: {
                  email: result.user.email,
                  avatarUri: '',
                  firstName: result.user.firstName,
                  lastName: result.user.lastName,
                },
              });
            } else {
              user = userFactory.create({
                admin: false,
                options: {
                  email: result.user.email,
                  avatarUri: '',
                  firstName: result.user.firstName,
                  lastName: result.user.lastName,
                },
              });
            }
          }
          if (bcmsConfig.database.fs) {
            user._id = result.user._id;
          } else {
            user._id = new Types.ObjectId(result.user._id);
          }
          user.password = await bcrypt.hash(
            crypto.randomBytes(64).toString(),
            10,
          );
          if (createUser) {
            user = await userRepo.add(user as never);
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
            issuer: bcmsConfig.jwt.scope,
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
