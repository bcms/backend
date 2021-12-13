import { BCMSRepo } from '@bcms/repo';
import type { BCMSJwtApiRouteProtectionPreRequestHandlerResult } from '@bcms/types';
import { createJwtApiProtectionPreRequestHandler } from '@bcms/util';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

interface GetInfoData {
  entry: number;
  group: number;
  color: number;
  language: number;
  media: number;
  status: number;
  tag: number;
  templates: number;
  widget: number;
}

export const BCMSChangeController = createController({
  name: 'Change Controller',
  path: '/api/changes',

  methods() {
    return {
      getInfo: createControllerMethod<
        BCMSJwtApiRouteProtectionPreRequestHandlerResult,
        GetInfoData
      >({
        path: '/info',
        type: 'get',
        preRequestHandler: createJwtApiProtectionPreRequestHandler({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.READ,
        }),
        async handler() {
          const changes = await BCMSRepo.change.findAll();
          const output: GetInfoData = {
            color: 0,
            entry: 0,
            group: 0,
            language: 0,
            media: 0,
            status: 0,
            tag: 0,
            templates: 0,
            widget: 0,
          };
          for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            output[change.name] = change.updatedAt;
          }
          return output;
        },
      }),
    };
  },
});
