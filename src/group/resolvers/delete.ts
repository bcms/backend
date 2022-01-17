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

export const BCMSGroupDeleteResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { id: string },
  string
>({
  name: 'delete',
  return: {
    type: 'String',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    id: 'String!',
  },
  async resolve({
    accessToken,
    errorHandler,
    id,
    logger,
    collectionName,
    resolverName,
  }) {
    const endpointName = `${collectionName}.${resolverName}`;
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.DELETE,
      roles: [JWTRoleName.ADMIN],
    });
    await BCMSGroupRequestHandler.delete({
      errorHandler,
      id,
      logger,
      name: endpointName,
      accessToken: jwt,
    });
    return 'Success';
  },
});
