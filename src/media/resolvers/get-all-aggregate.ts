import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSMediaAggregate,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSMediaRequestHandler } from '../request-handler';

export const BCMSMediaGetAllAggregatedResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType,
  BCMSMediaAggregate[]
>({
  name: 'getAllAggregated',
  return: {
    type: 'BCMSMediaAggregateArray',
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
    return await BCMSMediaRequestHandler.getAllAggregated();
  },
});
