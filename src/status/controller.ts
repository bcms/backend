import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus, StringUtility } from '@becomes/purple-cheetah/types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { useBcmsStatusFactory } from './factory';
import { useBcmsStatusRepository } from './repository';
import {
  BCMSResponseCode,
  BCMSSocketEventType,
  BCMSSocketManager,
  BCMSStatusCreateData,
  BCMSStatusCreateDataSchema,
  BCMSStatusFactory,
  BCMSStatusRepository,
  BCMSStatusUpdateData,
  BCMSStatusUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { useBcmsResponseCode } from '../response-code';
import { useBcmsSocketManager } from '../socket';

interface Setup {
  statusRepo: BCMSStatusRepository;
  statusFactory: BCMSStatusFactory;
  resCode: BCMSResponseCode;
  stringUtil: StringUtility;
  socket: BCMSSocketManager;
}

export const BCMSStatusController = createController<Setup>({
  name: 'Status controller',
  path: '/api/status',
  setup() {
    return {
      statusRepo: useBcmsStatusRepository(),
      statusFactory: useBcmsStatusFactory(),
      resCode: useBcmsResponseCode(),
      stringUtil: useStringUtility(),
      socket: useBcmsSocketManager(),
    };
  },
  methods({ statusRepo, statusFactory, resCode, stringUtil, socket }) {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            items: await statusRepo.findAll(),
          };
        },
      }),

      count: createControllerMethod({
        path: '/count',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler() {
          return {
            count: statusRepo.count(),
          };
        },
      }),

      getById: createControllerMethod({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          const status = await statusRepo.findById(id);
          if (!status) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('sts001', {
                id,
              }),
            );
          }
          return {
            item: status,
          };
        },
      }),

      create: createControllerMethod({
        type: 'post',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSStatusCreateData>({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.READ,
            bodySchema: BCMSStatusCreateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken }) {
          const status = statusFactory.create({
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
            color: body.color,
          });
          const statusWithSameName = await statusRepo.methods.findByName(
            status.name,
          );
          if (statusWithSameName) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('sts002', { name: status.name }),
            );
          }
          const addedStatus = await statusRepo.add(status as never);
          if (!addedStatus) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('sts003'),
            );
          }
          await socket.emit.status({
            statusId: `${addedStatus._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedStatus,
          };
        },
      }),

      update: createControllerMethod({
        type: 'put',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSStatusUpdateData>({
            roleNames: [JWTRoleName.ADMIN],
            permissionName: JWTPermissionName.READ,
            bodySchema: BCMSStatusUpdateDataSchema,
          }),
        async handler({ body, errorHandler, accessToken }) {
          const id = body._id;
          const status = await statusRepo.findById(id);
          if (!status) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('sts001', {
                id,
              }),
            );
          }
          let changeDetected = false;
          if (typeof body.label === 'string' && status.label !== body.label) {
            changeDetected = true;
            const newName = stringUtil.toSlugUnderscore(body.label);
            if (status.name !== newName) {
              const statusWithSameName = await statusRepo.methods.findByName(
                newName,
              );
              if (statusWithSameName) {
                throw errorHandler.occurred(
                  HTTPStatus.FORBIDDEN,
                  resCode.get('sts002', { name: newName }),
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
              resCode.get('g003'),
            );
          }
          const updatedStatus = await statusRepo.update(status as never);
          if (!updatedStatus) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('sts004'),
            );
          }
          await socket.emit.status({
            statusId: `${updatedStatus._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: updatedStatus,
          };
        },
      }),

      deleteById: createControllerMethod({
        path: '/:id',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler, accessToken }) {
          const id = request.params.id;
          const status = await statusRepo.findById(id);
          if (!status) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('sts001', {
                id,
              }),
            );
          }
          const deleteResult = await statusRepo.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('sts005'),
            );
          }
          await socket.emit.status({
            statusId: `${status._id}`,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
