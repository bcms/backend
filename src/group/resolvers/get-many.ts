import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSGroupGql,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSGroupRequestHandler } from '../request-handler';

export const BCMSGroupGetManyResolver = createGraphqlResolver<
  void,
  BCMSGraphqlSecurityArgsType & { ids: string },
  BCMSGroupGql[]
>({
  name: 'getMany',
  return: {
    type: 'BCMSGroupArray',
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
    return (await BCMSGroupRequestHandler.getMany(ids.split('-'))).map(
      (group) => {
        return {
          ...group,
          props: BCMSFactory.prop.toGql(group.props),
        } as BCMSGroupGql;
      },
    );
  },
});
