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
import { useBcmsResponseCode } from '../response-code';
import { useBcmsSocketManager } from '../socket';
import {
  BCMSResponseCode,
  BCMSSocketEventType,
  BCMSSocketManager,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerCreateDataSchema,
  BCMSTemplateOrganizerFactory,
  BCMSTemplateOrganizerRepository,
  BCMSTemplateOrganizerUpdateData,
  BCMSTemplateOrganizerUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { useBcmsTemplateOrganizerFactory } from './factory';
import { useBcmsTemplateOrganizerRepository } from './repository';

interface Setup {
  tempOrgRepo: BCMSTemplateOrganizerRepository;
  tempOrgFactory: BCMSTemplateOrganizerFactory;
  resCode: BCMSResponseCode;
  stringUtil: StringUtility;
  socket: BCMSSocketManager;
}

export const BCMSTemplateOrganizerController = createController<Setup>({
  name: 'Template organizer controller',
  path: '/api/template/organizer',
  setup() {
    return {
      tempOrgRepo: useBcmsTemplateOrganizerRepository(),
      tempOrgFactory: useBcmsTemplateOrganizerFactory(),
      resCode: useBcmsResponseCode(),
      stringUtil: useStringUtility(),
      socket: useBcmsSocketManager(),
    };
  },
  methods({ tempOrgRepo, tempOrgFactory, resCode, stringUtil, socket }) {
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
            items: await tempOrgRepo.findAll(),
          };
        },
      }),
      getMany: createControllerMethod({
        path: '/many',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await tempOrgRepo.findAllById(ids),
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
          const tempOrg = await tempOrgRepo.findById(request.params.id);
          if (!tempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tpo001', { id: request.params.id }),
            );
          }
          return {
            item: tempOrg,
          };
        },
      }),
      create: createControllerMethod({
        type: 'post',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSTemplateOrganizerCreateData>(
            {
              bodySchema: BCMSTemplateOrganizerCreateDataSchema,
              permissionName: JWTPermissionName.WRITE,
              roleNames: [JWTRoleName.ADMIN],
            },
          ),
        async handler({ errorHandler, body, accessToken }) {
          const org = tempOrgFactory.create({
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
            parentId: body.parentId,
            templateIds: body.templateIds,
          });
          const addedOrg = await tempOrgRepo.add(org as never);
          if (!addedOrg) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('tpo003'),
            );
          }
          await socket.emit.templateOrganizer({
            templateOrganizerId: `${addedOrg._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedOrg,
          };
        },
      }),
      update: createControllerMethod({
        type: 'put',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSTemplateOrganizerUpdateData>(
            {
              bodySchema: BCMSTemplateOrganizerUpdateDataSchema,
              permissionName: JWTPermissionName.WRITE,
              roleNames: [JWTRoleName.ADMIN],
            },
          ),
        async handler({ errorHandler, body, accessToken }) {
          const tempOrg = await tempOrgRepo.findById(body._id);
          if (!tempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tpo001', { id: body._id }),
            );
          }
          let changeDetected = false;
          if (typeof body.label === 'string' && body.label !== tempOrg.label) {
            changeDetected = true;
            tempOrg.label = body.label;
            tempOrg.name = stringUtil.toSlugUnderscore(body.label);
          }
          if (
            typeof body.parentId === 'string' &&
            body.parentId !== tempOrg.parentId
          ) {
            changeDetected = true;
            tempOrg.parentId = body.parentId;
            const parentOrg = await tempOrgRepo.findById(body.parentId);
            if (!parentOrg) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                resCode.get('tpo001', { id: body.parentId }),
              );
            }
          }
          if (typeof body.templateIds === 'object') {
            changeDetected = true;
            tempOrg.templateIds = body.templateIds;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              resCode.get('g003'),
            );
          }
          const updatedTempOrg = await tempOrgRepo.update(tempOrg as never);
          if (!updatedTempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('tpo002'),
            );
          }
          await socket.emit.templateOrganizer({
            templateOrganizerId: `${updatedTempOrg._id}`,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: updatedTempOrg,
          };
        },
      }),
      deleteById: createControllerMethod({
        path: '/:id',
        type: 'delete',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request, errorHandler, accessToken }) {
          const tempOrg = await tempOrgRepo.findById(request.params.id);
          if (!tempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              resCode.get('tpo001', { id: request.params.id }),
            );
          }
          const deleteResult = await tempOrgRepo.deleteById(request.params.id);
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              resCode.get('tpo004'),
            );
          }
          await socket.emit.templateOrganizer({
            templateOrganizerId: `${tempOrg._id}`,
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
