import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSTemplateCreateData,
  BCMSTemplateGql,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTemplateRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSTemplateCreateData;
}

export const BCMSTemplateCreateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSTemplateGql
>({
  name: 'create',
  return: {
    type: 'BCMSTemplate',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSTemplateCreateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN],
    });
    const template = await BCMSTemplateRequestHandler.create({
      accessToken: jwt,
      body: data,
      errorHandler,
    });
    return {
      ...template,
      props: BCMSFactory.prop.toGql(template.props),
    } as BCMSTemplateGql;
  },
});
