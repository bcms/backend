import { bcmsCreateDocObject } from '@bcms/doc';
import { BCMSRepo } from '@bcms/repo';
import type { BCMSRouteProtectionJwtApiResult } from '@bcms/types';
import { BCMSRouteProtection } from '@bcms/util';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSChangeGetInfoDataProp {
  count: number;
  lastChangeAt: number;
}
export const BCMSChangeGetInfoDataPropSchema: ObjectSchema = {
  count: {
    __type: 'number',
    __required: true,
  },
  lastChangeAt: {
    __type: 'number',
    __required: true,
  },
};

export interface BCMSChangeGetInfoData {
  entry: BCMSChangeGetInfoDataProp;
  group: BCMSChangeGetInfoDataProp;
  color: BCMSChangeGetInfoDataProp;
  language: BCMSChangeGetInfoDataProp;
  media: BCMSChangeGetInfoDataProp;
  status: BCMSChangeGetInfoDataProp;
  tag: BCMSChangeGetInfoDataProp;
  templates: BCMSChangeGetInfoDataProp;
  widget: BCMSChangeGetInfoDataProp;
}
export const BCMSChangeGetInfoDataSchema: ObjectSchema = {
  entry: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  group: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  color: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  language: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  media: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  status: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  tag: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  templates: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
  widget: {
    __type: 'object',
    __required: true,
    __child: BCMSChangeGetInfoDataPropSchema,
  },
};

export const BCMSChangeController = createController({
  name: 'Change',
  path: '/api/changes',

  methods() {
    return {
      getInfo: createControllerMethod<
        BCMSRouteProtectionJwtApiResult,
        BCMSChangeGetInfoData
      >({
        path: '/info',
        type: 'get',
        doc: bcmsCreateDocObject({
          summary: 'Get change information',
          security: ['AccessToken', 'ApiKey'],
          response: {
            json: 'BCMSChangeGetInfoData',
          },
        }),
        preRequestHandler: BCMSRouteProtection.createJwtApiPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler() {
          const changes = await BCMSRepo.change.findAll();
          const output: BCMSChangeGetInfoData = {
            color: {
              count: 0,
              lastChangeAt: 0,
            },
            entry: {
              count: 0,
              lastChangeAt: 0,
            },
            group: {
              count: 0,
              lastChangeAt: 0,
            },
            language: {
              count: 0,
              lastChangeAt: 0,
            },
            media: {
              count: 0,
              lastChangeAt: 0,
            },
            status: {
              count: 0,
              lastChangeAt: 0,
            },
            tag: {
              count: 0,
              lastChangeAt: 0,
            },
            templates: {
              count: 0,
              lastChangeAt: 0,
            },
            widget: {
              count: 0,
              lastChangeAt: 0,
            },
          };
          for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            output[change.name] = {
              count: change.count,
              lastChangeAt: change.updatedAt,
            };
          }
          return output;
        },
      }),
    };
  },
});
