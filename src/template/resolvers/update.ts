import { BCMSFactory } from '@bcms/factory';
import { securityVerifyJWT } from '@bcms/security';
import {
  BCMSGraphqlSecurityArgs,
  BCMSGraphqlSecurityArgsType,
  BCMSPropData,
  BCMSTemplateGql,
  BCMSTemplateUpdateData,
  BCMSTemplateUpdateDataGql,
} from '@bcms/types';
import { createGraphqlResolver } from '@becomes/purple-cheetah-mod-graphql';
import { GraphqlResolverType } from '@becomes/purple-cheetah-mod-graphql/types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { BCMSTemplateRequestHandler } from '../request-handler';

interface Args extends BCMSGraphqlSecurityArgsType {
  data: BCMSTemplateUpdateDataGql;
}

export const BCMSTemplateUpdateResolver = createGraphqlResolver<
  void,
  Args,
  BCMSTemplateGql
>({
  name: 'update',
  return: {
    type: 'BCMSTemplate',
  },
  type: GraphqlResolverType.MUTATION,
  args: {
    ...BCMSGraphqlSecurityArgs,
    data: 'BCMSTemplateUpdateData!',
  },
  async resolve({ accessToken, errorHandler, data }) {
    const jwt = securityVerifyJWT({
      token: accessToken,
      errorHandler,
      permission: JWTPermissionName.WRITE,
      roles: [JWTRoleName.ADMIN, JWTRoleName.USER],
    });
    const body: BCMSTemplateUpdateData = {
      _id: data._id,
      desc: data.desc,
      label: data.label,
      singleEntry: data.singleEntry,
      propChanges: data.propChanges
        ? data.propChanges.map((change) => {
            let defaultData: BCMSPropData | undefined = undefined;
            if (change.add && change.add.defaultData) {
              const dData = change.add.defaultData;
              if (dData.boolean) {
                defaultData = dData.boolean;
              } else if (dData.colorPicker) {
                defaultData = dData.colorPicker;
              } else if (dData.entryPointer) {
                defaultData = dData.entryPointer;
              } else if (dData.enum) {
                defaultData = dData.enum;
              } else if (dData.groupPointer) {
                defaultData = dData.groupPointer;
              } else if (dData.media) {
                defaultData = dData.media;
              } else if (dData.number) {
                defaultData = dData.number;
              } else if (dData.string) {
                defaultData = dData.string;
              } else if (dData.tag) {
                defaultData = dData.tag;
              } else if (dData.date) {
                defaultData = dData.date;
              }
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
    const template = await BCMSTemplateRequestHandler.update({
      accessToken: jwt,
      body,
      errorHandler,
    });
    return {
      ...template,
      props: BCMSFactory.prop.toGql(template.props),
    } as BCMSTemplateGql;
  },
});
