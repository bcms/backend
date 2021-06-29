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
import { useResponseCode } from '../response-code';
import type { BCMSUserCustomPool, ResponseCode } from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { useBcmsStatusFactory } from './factory';
import { useBcmsStatusRepository } from './repository';
import {
  BCMSStatusCreateData,
  BCMSStatusCreateDataSchema,
  BCMSStatusFactory,
  BCMSStatusRepository,
  BCMSStatusUpdateData,
  BCMSStatusUpdateDataSchema,
} from './types';

interface Setup {
  statusRepo: BCMSStatusRepository;
  statusFactory: BCMSStatusFactory;
  resCode: ResponseCode;
  stringUtil: StringUtility;
}

export const BCMSStatusController = createController<Setup>({
  name: 'Status controller',
  path: '/api/status',
  setup() {
    return {
      statusRepo: useBcmsStatusRepository(),
      statusFactory: useBcmsStatusFactory(),
      resCode: useResponseCode(),
      stringUtil: useStringUtility(),
    };
  },
  methods({ statusRepo, statusFactory, resCode, stringUtil }) {
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
        preRequestHandler: createJwtAndBodyCheckRouteProtection<
          BCMSUserCustomPool,
          BCMSStatusCreateData
        >({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.READ,
          bodySchema: BCMSStatusCreateDataSchema,
        }),
        async handler({ body, errorHandler }) {
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

          // TODO: trigger socket event and event manager

          return {
            item: addedStatus,
          };
        },
      }),

      update: createControllerMethod({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection<
          BCMSUserCustomPool,
          BCMSStatusUpdateData
        >({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.READ,
          bodySchema: BCMSStatusUpdateDataSchema,
        }),
        async handler({ body, errorHandler }) {
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

          // TODO: trigger socket event and event manager

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
          const deleteResult = await statusRepo.deleteById(id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('sts005'),
            );
          }

          // TODO: trigger socket event and event manager

          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
