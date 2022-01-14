import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSStatus,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSStatusRequestHandler } from '../request-handler';

export const BCMSStatusGetAllResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType,
  BCMSStatus[]
>({
  name: 'getAll',
  return: {
    type: 'BCMSStatusArray',
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
    return await BCMSStatusRequestHandler.getAll();
  },
});
