import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSStatus,
  BCMSStatusCreateData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSStatusRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSStatusCreateData;
}

export const BCMSStatusCreateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSStatus
>({
  name: 'create',
  return: {
    type: 'BCMSStatus',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSStatusCreateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN],
    });
    return await BCMSStatusRequestHandler.create({
      accessToken: jwt,
      errorHandler,
      body: data,
    });
  },
});
