import {
  createController,
  createControllerMethod,
  createHTTPError,
  useLogger,
} from '@becomes/purple-cheetah';
import {
  createJwtProtectionPreRequestHandler,
  useJwt,
} from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTError,
  JWTManager,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPException, HTTPStatus } from '@becomes/purple-cheetah/types';
import { useBcmsResponseCode } from '../response-code';
import { useBcmsApiKeySecurity } from '../security';
import type {
  BCMSApiKey,
  BCMSApiKeySecurity,
  BCMSUserCustomPool,
  BCMSResponseCode,
  BCMSFunctionManager,
} from '../types';
import { useBcmsFunctionManger } from './main';

interface Setup {
  fnManager: BCMSFunctionManager;
  resCode: BCMSResponseCode;
  jwt: JWTManager;
  apiSecurity: BCMSApiKeySecurity;
}

export const BCMSFunctionController = createController<Setup>({
  name: 'Function controller',
  path: '/api/function',
  setup() {
    return {
      fnManager: useBcmsFunctionManger(),
      resCode: useBcmsResponseCode(),
      jwt: useJwt(),
      apiSecurity: useBcmsApiKeySecurity(),
    };
  },
  methods({ fnManager, resCode, jwt, apiSecurity }) {
    return {
      getAvailable: createControllerMethod({
        path: '/available',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            functions: fnManager.getAll().map((e) => {
              return {
                name: e.config.name,
                public: !!e.config.public,
              };
            }),
          };
        },
      }),
      execute: createControllerMethod<unknown, unknown>({
        path: '/:name',
        type: 'post',
        async handler({ request, errorHandler, logger, name }) {
          const fnName = request.params.name;
          const fn = fnManager.get(fnName);
          if (!fn) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('fn001', { name: request.params.name }),
            );
          }
          let apiKey: BCMSApiKey | null = null;
          let at: JWT<BCMSUserCustomPool> | null = null;
          if (!fn.config.public) {
            if (request.headers.authorization) {
              const accessToken = jwt.get<BCMSUserCustomPool>({
                jwtString: request.headers.authorization,
                roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
                permissionName: JWTPermissionName.READ,
              });
              if (accessToken instanceof JWTError) {
                throw errorHandler.occurred(
                  HTTPStatus.UNAUTHORIZED,
                  resCode.get('g001', {
                    msg: accessToken.message,
                  }),
                );
              }
              at = accessToken;
            } else {
              try {
                apiKey = await apiSecurity.verify(
                  apiSecurity.httpRequestToApiKeyRequest(request),
                );
              } catch (e) {
                throw errorHandler.occurred(
                  HTTPStatus.UNAUTHORIZED,
                  resCode.get('ak007', { msg: e.message }),
                );
              }
            }
          }

          try {
            const fnLogger = useLogger({
              name: fn.config.name,
            });
            return {
              success: true,
              result: await fn.handler({
                request,
                logger: fnLogger,
                errorHandler: createHTTPError({
                  logger: fnLogger,
                  place: fn.config.name,
                }),
                auth: apiKey ? apiKey : (at as JWT<BCMSUserCustomPool>),
              }),
            };
          } catch (error) {
            if (error instanceof HTTPException) {
              throw error;
            }
            logger.error(name, error);
            throw errorHandler.occurred(HTTPStatus.INTERNAL_SERVER_ERROR, {
              success: false,
              err: error.message,
            });
          }
        },
      }),
    };
  },
});
