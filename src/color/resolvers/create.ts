import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSColor,
  BCMSColorCreateData,
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
  body: BCMSColorCreateData;
}

export const BCMSColorCreateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSColor
>({
  name: 'create',
  return: {
    type: 'BCMSColor',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    body: 'BCMSColorCreateData!',
  },
  async resolve({ accessToken, errorHandler, body }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN],
    });
    const color = await BCMSColorRequestHandler.create({
      accessToken: jwt,
      body,
      errorHandler,
    });
    return color;
  },
});
