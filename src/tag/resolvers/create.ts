import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSTag,
  BCMSTagCreateData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTagRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSTagCreateData;
}

export const BCMSTagCreateResolver = createGraphqlResolver<void, Args, BCMSTag>(
  {
    name: 'create',
    return: {
      type: 'BCMSTag',
    },
    type: GraphqlResolverType.MUTATION,
    args: {
      ...BCMSGraphqlSecurityArgs,
      data: 'BCMSTagCreateData!',
    },
    async resolve({ accessToken, errorHandler, data }) {
      const jwt = securityVerifyJWT({
        token: accessToken,
        errorHandler,
        permission: JWTPermissionName.WRITE,
        roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
      });
      return await BCMSTagRequestHandler.create({
        accessToken: jwt,
        errorHandler,
        body: data,
      });
    },
  },
);
