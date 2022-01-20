import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSWidgetGql,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSWidgetRequestHandler } from '../request-handler';

export const BCMSWidgetManyResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { ids: string },
  BCMSWidgetGql[]
>({
  name: 'getMany',
  return: {
    type: 'BCMSWidgetArray',
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
    return (await BCMSWidgetRequestHandler.getMany(ids.split('-'))).map(
      (widget) => {
        return {
          ...widget,
          props: BCMSFactory.prop.toGql(widget.props),
        } as BCMSWidgetGql;
      },
    );
  },
});
