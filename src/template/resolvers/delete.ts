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
import { BCMSTemplateRequestHandler } from '../request-handler';

export const BCMSTemplateDeleteResolver = createGraphqlResolver<
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
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    console.log('oj', collectionName + resolverName);
    await BCMSTemplateRequestHandler.delete({
      errorHandler,
      id,
      accessToken: jwt,
      logger,
      name: collectionName + resolverName,
    });
    return 'Success.';
  },
});
