import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTemplateOrganizerRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSTemplateOrganizerCreateData;
}

export const BCMSTemplateOrganizerCreateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSTemplateOrganizer
>({
  name: 'create',
  return: {
    type: 'BCMSTemplateOrganizer',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSTemplateOrganizerCreateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN],
    });
    return await BCMSTemplateOrganizerRequestHandler.create({
      accessToken: jwt,
      body: data,
      errorHandler,
    });
  },
});
