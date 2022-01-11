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
import { BCMSTagRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  id: string;
  name: string;
}
export const BCMSTagDeleteResolver = createGraphqlResolver<void, Args, string>({
  name: 'delete',
  return: {
    type: 'String',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    id: 'String!',
    name: 'String!',
  },
  async resolve({ accessToken, errorHandler, id, name, logger }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    await BCMSTagRequestHandler.delete({
      id,
      name,
      logger,
      errorHandler,
      accessToken: jwt,
    });
    return 'Success.';
  },
});
