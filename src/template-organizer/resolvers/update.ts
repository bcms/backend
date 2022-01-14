import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerUpdateData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTemplateOrganizerRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSTemplateOrganizerUpdateData;
}

export const BCMSTemplateOrganizerUpdateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSTemplateOrganizer
>({
  name: 'update',
  return: {
    type: 'BCMSTemplateOrganizer',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSTemplateOrganizerUpdateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    return await BCMSTemplateOrganizerRequestHandler.update({
      errorHandler,
      accessToken: jwt,
      body: data,
    });
  },
});
