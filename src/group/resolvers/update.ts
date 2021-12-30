import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSGroupGql,
  BCMSGroupUpdateData,
  BCMSGroupUpdateDataGql,
  BCMSPropData,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSGroupRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSGroupUpdateDataGql;
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
    const body: BCMSGroupUpdateData = {
      _id: data._id,
      desc: data.desc,
      label: data.label,
      propChanges: data.propChanges
        ? data.propChanges.map((change) => {
            let defaultData: BCMSPropData | undefined = undefined;
            if (change.add && change.add.defaultData) {
              const dData = change.add.defaultData;
              if (dData.boolean) {
                defaultData = dData.boolean;
              } else if (dData.color) {
                defaultData = dData.color;
              }
              // TODO: Add rest
            }
            return {
              update: change.update,
              remove: change.remove,
              transform: change.transform,
              add: change.add
                ? {
                    array: change.add.array,
                    label: change.add.label,
                    required: change.add.required,
                    type: change.add.type,
                    defaultData: defaultData ? defaultData : undefined,
                  }
                : undefined,
            };
          })
        : undefined,
    };
    const group = await BCMSGroupRequestHandler.update({
      accessToken: jwt,
      body,
      errorHandler,
    });
    return {
      ...group,
      props: BCMSFactory.prop.toGql(group.props),
    } as BCMSGroupGql;
  },
});
