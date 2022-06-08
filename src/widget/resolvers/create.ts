import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSWidgetCreateData,
  BCMSWidgetGql,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSWidgetRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSWidgetCreateData;
}

export const BCMSWidgetCreateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSWidgetGql
>({
  name: 'create',
  return: {
    type: 'BCMSWidget',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSWidgetCreateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN],
    });
    const widget = await BCMSWidgetRequestHandler.create({
      accessToken: jwt,
      body: data,
      errorHandler,
    });
    return {
      ...widget,
      props: BCMSFactory.prop.toGql(widget.props),
    } as BCMSWidgetGql;
  },
});
