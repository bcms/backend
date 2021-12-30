import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSGroupGql,
  BCMSGroupUpdateData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSGroupRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSGroupUpdateData;
}

export const BCMSGroupUpdateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSGroupGql
>({
  name: 'update',
  return: {
    type: 'BCMSGroup',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSGroupUpdateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    const group = await BCMSGroupRequestHandler.update({
      accessToken: jwt,
      body: data,
      errorHandler,
    });
    return {
      ...group,
      props: BCMSFactory.prop.toGql(group.props),
    } as BCMSGroupGql;
  },
});
