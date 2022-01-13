import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSTemplateOrganizer,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTemplateOrganizerRequestHandler } from '../request-handler';

export const BCMSTemplateOrganizerGetManyResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { ids: string },
  BCMSTemplateOrganizer[]
>({
  name: 'getMany',
  return: {
    type: 'BCMSTemplateOrganizerArray',
  },
  type: GraphqlResolverType.QUERY,
  args: {
    ...BCMSGraphqlSecurityArgs,
    ids: 'String!',
  },
  async resolve({ accessToken, errorHandler, ids }) {
    securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.READ,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    return await BCMSTemplateOrganizerRequestHandler.getMany(ids.split('-'));
  },
});
