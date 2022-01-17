import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSMedia,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSMediaRequestHandler } from '../request-handler';

export const BCMSMediaGetManyResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { ids: string },
  BCMSMedia[]
>({
  name: 'getMany',
  return: { type: 'BCMSMediaArray' },
  type: GraphqlResolverType.QUERY,
  args: {
    ...BCMSGraphqlSecurityArgs,
    ids: 'String!',
  },
  async resolve({ accessToken, errorHandler, ids }) {
    securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.DEV],
    });
    return await BCMSMediaRequestHandler.getMany(ids.split('-'));
  },
});
