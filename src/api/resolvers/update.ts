import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSApiKey,
  BCMSApiKeyUpdateData,
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSApiKeyRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSApiKeyUpdateData;
}

export const BCMSApiKeyUpdateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSApiKey
>({
  name: 'update',
  return: {
    type: 'BCMSApiKey',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSApiKeyUpdateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN],
    });
    return await BCMSApiKeyRequestHandler.update({
      errorHandler,
      accessToken: jwt,
      body: data,
    });
  },
});
