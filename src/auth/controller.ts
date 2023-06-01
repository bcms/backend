import { BCMSConfig } from '@bcms/config';
import { bcmsCreateDocObject } from '@bcms/doc';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import {
  createController,
  createControllerMethod,
  useRefreshTokenService,
} from '@becomes/purple-cheetah';
import { useJwt, useJwtEncoding } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTEncoding,
  JWTError,
  JWTManager,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, RefreshTokenService } from '@becomes/purple-cheetah/types';

interface Setup {
  rt: RefreshTokenService;
  jwtManager: JWTManager;
  jwtEncoder: JWTEncoding;
}

export const BCMSAuthController = createController<Setup>({
  name: 'Auth',
  path: '/api/auth',
  setup() {
    return {
      rt: useRefreshTokenService(),
      jwtManager: useJwt(),
      jwtEncoder: useJwtEncoding(),
    };
  },
  methods({ rt, jwtManager, jwtEncoder }) {
    return {
      refreshAccess: createControllerMethod<void, { accessToken: string }>({
        path: '/token/refresh/:userId',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Refresh access token',
          params: [
            {
              name: 'userId',
              type: 'path',
              required: true,
              description: 'ID of a user to which refresh token belongs.',
            },
          ],
          security: ['RefreshToken'],
          response: {
            jsonSchema: {
              accessToken: {
                __type: 'string',
                __required: true,
              },
            },
          },
        }),
        async handler({ request, errorHandler }) {
          if (typeof request.headers.authorization !== 'string') {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('a001'),
            );
          }
          const tokenValid = rt.exist(
            request.params.userId,
            (request.headers.authorization as string).replace('Bearer ', ''),
          );
          if (!tokenValid) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              bcmsResCode('a005'),
            );
          }
          const user = await BCMSRepo.user.findById(request.params.userId);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('u002', { id: request.params.userId }),
            );
          }
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
          };
        },
      }),

      logout: createControllerMethod<void, { ok: boolean }>({
        path: '/logout/:userId',
        type: 'post',
        doc: bcmsCreateDocObject({
          summary: 'Logout user',
          security: ['RefreshToken'],
          params: [
            {
              name: 'userId',
              type: 'path',
              required: true,
              description: 'ID of a user to which refresh token belongs.',
            },
          ],
          response: {
            jsonSchema: {
              ok: {
                __type: 'boolean',
                __required: true,
              },
            },
          },
        }),
        async handler({ request, errorHandler }) {
          if (typeof request.headers.authorization !== 'string') {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('a001'),
            );
          }
          rt.remove(
            request.params.userId,
            (request.headers.authorization as string).replace('Bearer ', ''),
          );
          return {
            ok: true,
          };
        },
      }),
    };
  },
});
