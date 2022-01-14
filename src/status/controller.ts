import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, StringUtility } from '@becomes/purple-cheetah/types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import {
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSSocketEventType,
  BCMSStatus,
  BCMSStatusCreateData,
  BCMSStatusCreateDataSchema,
  BCMSStatusUpdateData,
  BCMSStatusUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import { BCMSStatusRequestHandler } from './request-handler';

interface Setup {
  stringUtil: StringUtility;
}

export const BCMSStatusController = createController<Setup>({
  name: 'Status controller',
  path: '/api/status',
  setup() {
    return {
      stringUtil: useStringUtility(),
    };
  },
  methods({ stringUtil }) {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSStatus[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSStatusRequestHandler.getAll(),
          };
        },
      }),

      count: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { count: number }
      >({
        path: '/count',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            count: await BCMSRepo.status.count(),
          };
        },
      }),

      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSStatus }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          const status = await BCMSRepo.status.findById(id);
          if (!status) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('sts001', {
                id,
              }),
            );
          }
          return {
            item: status,
          };
        },
      }),

      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSStatusCreateData>,
        { item: BCMSStatus }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.READ,
          bodySchema: BCMSStatusCreateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          return {
            item: await BCMSStatusRequestHandler.create({
              body,
              errorHandler,
              accessToken,
            }),
          };
        },
      }),

      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSStatusUpdateData>,
        { item: BCMSStatus }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.READ,
          bodySchema: BCMSStatusUpdateDataSchema,
        }),
        async handler({ body, errorHandler, accessToken }) {
          const id = body._id;
          const status = await BCMSRepo.status.findById(id);
          if (!status) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('sts001', {
                id,
              }),
            );
          }
          let changeDetected = false;
          if (typeof body.label === 'string' && status.label !== body.label) {
            changeDetected = true;
            const newName = stringUtil.toSlugUnderscore(body.label);
            if (status.name !== newName) {
              const statusWithSameName =
                await BCMSRepo.status.methods.findByName(newName);
              if (statusWithSameName) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  bcmsResCode('sts002', { name: newName }),
                );
              }
              status.name = newName;
            }
            status.label = body.label;
          }
          if (typeof body.color === 'string' && status.color !== body.color) {
            changeDetected = true;
            status.color = body.color;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('g003'),
            );
          }
          const updatedStatus = await BCMSRepo.status.update(status);
          if (!updatedStatus) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('sts004'),
            );
          }
          await BCMSSocketManager.emit.status({
            statusId: updatedStatus._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('status');
          return {
            item: updatedStatus,
          };
        },
      }),

      deleteById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler, accessToken }) {
          const id = request.params.id;
          const status = await BCMSRepo.status.findById(id);
          if (!status) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('sts001', {
                id,
              }),
            );
          }
          const deleteResult = await BCMSRepo.status.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('sts005'),
            );
          }
          await BCMSSocketManager.emit.status({
            statusId: status._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('status');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
