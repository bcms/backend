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

export const BCMSMediaGetAllByParentIdResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { id: string },
  BCMSMedia[]
>({
  name: 'getAllByParentId',
  return: {
    type: 'BCMSMediaArray',
  },
  type: GraphqlResolverType.QUERY,
  args: {
    ...BCMSGraphqlSecurityArgs,
    id: 'String!',
  },
  async resolve({ accessToken, errorHandler, id }) {
    securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.DEV],
    });
    return await BCMSMediaRequestHandler.getAllByParentId({ id, errorHandler });
  },
});
