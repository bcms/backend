import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSTemplateGql,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTemplateRequestHandler } from '../request-handler';

export const BCMSTemplateManyResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { ids: string },
  BCMSTemplateGql[]
>({
  name: 'getMany',
  return: {
    type: 'BCMSTemplateArray',
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
    return (await BCMSTemplateRequestHandler.getMany(ids.split('-'))).map(
      (template) => {
        return {
          ...template,
          props: BCMSFactory.prop.toGql(template.props),
        } as BCMSTemplateGql;
      },
    );
  },
});
