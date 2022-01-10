import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSColor,
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSColorRequestHandler } from '../request-handler';

export const BCMSColorGetAllResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType,
  BCMSColor[]
>({
  name: 'getAll',
  return: {
    type: 'BCMSColorArray',
  },
  type: GraphqlResolverType.QUERY,
  args: {
    ...BCMSGraphqlSecurityArgs,
  },
  async resolve({ accessToken, errorHandler }) {
    securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    return await BCMSColorRequestHandler.getAll();
  },
});
