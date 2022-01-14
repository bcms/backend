import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSStatus,
  BCMSStatusUpdateData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSStatusRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSStatusUpdateData;
}

export const BCMSStatusUpdateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSStatus
>({
  name: 'update',
  return: {
    type: 'BCMSStatus',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSStatusUpdateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    return await BCMSStatusRequestHandler.update({
      errorHandler,
      accessToken: jwt,
      body: data,
    });
  },
});
