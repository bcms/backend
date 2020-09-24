import {
  RoleName,
  JWTConfig,
  JWT,
  HttpError,
  JWTSecurity,
  PermissionName,
  HttpStatus,
} from '@becomes/purple-cheetah';
import { ResponseCode } from '../response-code';
import { UserPolicy } from '../user';

export class JWTUtil {
  public static checkAuthorization(
    auth: {
      header: string;
      roles: RoleName[];
      permission: PermissionName;
      config: JWTConfig;
    },
    errorHandler: HttpError,
  ): JWT {
    const jwt = JWTSecurity.checkAndValidateAndGet(auth.header, {
      roles: auth.roles,
      permission: auth.permission,
      JWTConfig: auth.config,
    });
    if (jwt instanceof Error) {
      throw errorHandler.occurred(
        HttpStatus.UNAUTHORIZED,
        ResponseCode.get('g001', {
          msg: jwt.message,
        }),
      );
    }
    return jwt;
  }
  public static policyCheck(
    policy: UserPolicy,
    requestPath: string,
    requestMethod: string,
    templateId?: string,
  ): void {
    if (requestPath.startsWith('/api/media')) {
      if (!policy.media[requestMethod]) {
        throw new Error(
          `Provided policy does not allow to "${requestMethod}" a Media.`,
        );
      }
    } else if (requestPath.startsWith('/api/entry')) {
      const entryPolicy = policy.templates.find((e) => e._id === templateId);
      if (!entryPolicy) {
        throw new Error(
          `Provided policy does not allow access to Entries ` +
            `in Template "${templateId}".`,
        );
      }
      if (!entryPolicy[requestMethod]) {
        throw new Error(
          `Provided policy does not allow to "${requestMethod}" ` +
            `Entries in a Template "${templateId}".`,
        );
      }
    } else if (requestPath.startsWith('/dashboard/custom-portal')) {
    }
  }
}
