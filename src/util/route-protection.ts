import { BCMSApiKeySecurity } from '@bcms/security';
import { useObjectUtility } from '@becomes/purple-cheetah';
import { useJwt } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWT,
  JWTError,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import {
  ControllerMethodPreRequestHandler,
  HTTPStatus,
  ObjectSchema,
  ObjectUtilityError,
} from '@becomes/purple-cheetah/types';
import type {
  BCMSApiKey,
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSUserCustomPool,
} from '../types';

export function createJwtAndBodyCheckRouteProtection<Body>(config: {
  roleNames: JWTRoleName[];
  permissionName: JWTPermissionName;
  bodySchema: ObjectSchema;
}): ControllerMethodPreRequestHandler<
  BCMSJWTAndBodyCheckerRouteProtectionResult<Body>
> {
  const jwt = useJwt();
  const objectUtil = useObjectUtility();

  return async ({ request, errorHandler }) => {
    const accessToken = jwt.get<BCMSUserCustomPool>({
      jwtString: request.headers.authorization as string,
      roleNames: config.roleNames,
      permissionName: config.permissionName,
    });
    if (accessToken instanceof JWTError) {
      throw errorHandler.occurred(HTTPStatus.UNAUTHORIZED, accessToken.message);
    }
    const checkBody = objectUtil.compareWithSchema(
      request.body,
      config.bodySchema,
      'body',
    );
    if (checkBody instanceof ObjectUtilityError) {
      throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, checkBody.message);
    }

    return {
      accessToken,
      body: request.body,
    };
  };
}

export function createJwtApiProtectionPreRequestHandler(config: {
  roleNames: JWTRoleName[];
  permissionName: JWTPermissionName;
}): ControllerMethodPreRequestHandler<{
  token?: JWT<BCMSUserCustomPool>;
  key?: BCMSApiKey;
}> {
  const jwt = useJwt();

  return async ({ request, errorHandler }) => {
    if (request.query.signature) {
      try {
        const key = await BCMSApiKeySecurity.verify(
          BCMSApiKeySecurity.httpRequestToApiKeyRequest(request),
        );
        return {
          key,
        };
      } catch (err) {
        const error = err as Error;
        throw errorHandler.occurred(HTTPStatus.UNAUTHORIZED, error.message);
      }
    } else {
      const token = jwt.get<BCMSUserCustomPool>({
        jwtString: request.headers.authorization as string,
        roleNames: config.roleNames,
        permissionName: config.permissionName,
      });
      if (token instanceof JWTError) {
        throw errorHandler.occurred(HTTPStatus.UNAUTHORIZED, token.message);
      }
      return {
        token,
      };
    }
  };
}
