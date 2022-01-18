import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSMedia,
  BCMSMediaDuplicateData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSMediaRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSMediaDuplicateData;
}

export const BCMSMediaDuplicateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSMedia
>({
  name: 'duplicate',
  return: {
    type: 'BCMSMedia',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSMediaDuplicateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    return await BCMSMediaRequestHandler.duplicateFile({
      errorHandler,
      accessToken: jwt,
      body: data,
    });
  },
});
