import type { JWT } from '@becomes/purple-cheetah-mod-jwt/types';
import type { BCMSApiKey } from '..';
import type { BCMSUserCustomPool } from '../user';

export interface BCMSJWTAndBodyCheckerRouteProtectionResult<Body> {
  accessToken: JWT<BCMSUserCustomPool>;
  body: Body;
}

export interface BCMSJwtApiRouteProtectionPreRequestHandlerResult {
  token?: JWT<BCMSUserCustomPool>;
  key?: BCMSApiKey;
}
