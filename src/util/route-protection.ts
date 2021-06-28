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

export function createJwtAndBodyCheckRouteProtection<JWTProps, Body>(config: {
  roleNames: JWTRoleName[];
  permissionName: JWTPermissionName;
  bodySchema: ObjectSchema;
}): ControllerMethodPreRequestHandler<{
  accessToken: JWT<JWTProps>;
  body: Body;
}> {
  const jwt = useJwt();
  const objectUtil = useObjectUtility();

  return async ({ request, errorHandler }) => {
    const accessToken = jwt.get<JWTProps>({
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
