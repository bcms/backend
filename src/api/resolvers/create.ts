import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSApiKey,
  BCMSApiKeyAddData,
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
  data: BCMSApiKeyAddData;
}

export const BCMSApiKeyCreateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSApiKey
>({
  name: 'create',
  return: {
    type: 'BCMSApiKey',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSApiKeyCreateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN],
    });
    const apiKey = await BCMSApiKeyRequestHandler.create({
      accessToken: jwt,
      body: data,
      errorHandler,
    });
    return apiKey;
  },
});
