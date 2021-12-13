import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSChange,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';

export const BCMSChangeController = createController({
  name: 'Change Controller',
  path: '/api/changes',

  methods() {
    return {
      //   getInfo: createControllerMethod<
      //     JWTPreRequestHandlerResult<BCMSUserCustomPool>,
      //     { items: BCMSChange }
      //   >({
      //     path: '/info',
      //     type: 'get',
      //     preRequestHandler: createJwtProtectionPreRequestHandler(
      //       [JWTRoleName.ADMIN, JWTRoleName.USER],
      //       JWTPermissionName.READ,
      //     ),
      //     async handler() {
      //       return {
      //         items: []
      //       };
      //     },
      //   }),
      create: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSChange }
      >({
        type: 'post',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ errorHandler, accessToken }) {
          const change = BCMSFactory.change.create({});
          const addChange = await BCMSRepo.change.add(change);
          if (!addChange) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('chg003'),
            );
          }
          await BCMSSocketManager.emit.change({
            changeId: addChange._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addChange,
          };
        },
      }),
    };
  },
});
