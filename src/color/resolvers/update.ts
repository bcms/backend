import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSColor,
  BCMSColorUpdateData,
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSColorRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSColorUpdateData;
}

export const BCMSColorUpdateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSColor
>({
  name: 'update',
  return: {
    type: 'BCMSColor',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSColorUpdateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    return await BCMSColorRequestHandler.update({
      errorHandler,
      accessToken: jwt,
      body: data,
    });
  },
});
