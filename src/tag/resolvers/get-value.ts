import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSTag,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTagRequestHandler } from '../request-handler';

export const BCMSTagGetByValueResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { value: string },
  BCMSTag
>({
  name: 'getByValue',
  return: {
    type: 'BCMSTag',
  },
  type: GraphqlResolverType.QUERY,
  args: {
    ...BCMSGraphqlSecurityArgs,
    value: 'String!',
  },
  async resolve({ accessToken, errorHandler, value }) {
    securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    return await BCMSTagRequestHandler.getByValue({ value, errorHandler });
  },
});
