import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSGroupRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  id: string;
  name: string;
}

export const BCMSGroupDeleteResolver = createGraphqlResolver<
  void,
  Args,
  string
>({
  name: 'getOne',
  return: {
    type: 'BCMSGroup',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    id: 'String!',
    name: 'String!',
  },
  async resolve({ accessToken, errorHandler, id, logger, name }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    await BCMSGroupRequestHandler.delete({
      errorHandler,
      id,
      logger,
      name,
      accessToken: jwt,
    });
    return 'Success';
  },
});
