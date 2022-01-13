import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
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
import {
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSSocketEventType,
  BCMSTemplateOrganizer,
  BCMSTemplateOrganizerCreateData,
  BCMSTemplateOrganizerCreateDataSchema,
  BCMSTemplateOrganizerUpdateData,
  BCMSTemplateOrganizerUpdateDataSchema,
  BCMSUserCustomPool,
} from '../types';
import { createJwtAndBodyCheckRouteProtection } from '../util';
import { BCMSTemplateOrganizerRequestHandler } from './request-handler';

interface Setup {
  stringUtil: StringUtility;
}

export const BCMSTemplateOrganizerController = createController<Setup>({
  name: 'Template organizer controller',
  path: '/api/template/organizer',
  setup() {
    return {
      stringUtil: useStringUtility(),
    };
  },
  methods({ stringUtil }) {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplateOrganizer[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSRepo.templateOrganizer.findAll(),
          };
        },
      }),
      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTemplateOrganizer[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          return {
            items: await BCMSRepo.templateOrganizer.findAllById(ids),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTemplateOrganizer }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const tempOrg = await BCMSRepo.templateOrganizer.findById(
            request.params.id,
          );
          if (!tempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tpo001', { id: request.params.id }),
            );
          }
          return {
            item: tempOrg,
          };
        },
      }),
      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateOrganizerCreateData>,
        { item: BCMSTemplateOrganizer }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          bodySchema: BCMSTemplateOrganizerCreateDataSchema,
          permissionName: JWTPermissionName.WRITE,
          roleNames: [JWTRoleName.ADMIN],
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSTemplateOrganizerRequestHandler.create({
              errorHandler,
              body,
              accessToken,
            }),
          };
        },
      }),
      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTemplateOrganizerUpdateData>,
        { item: BCMSTemplateOrganizer }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          bodySchema: BCMSTemplateOrganizerUpdateDataSchema,
          permissionName: JWTPermissionName.WRITE,
          roleNames: [JWTRoleName.ADMIN],
        }),
        async handler({ errorHandler, body, accessToken }) {
          const tempOrg = await BCMSRepo.templateOrganizer.findById(body._id);
          if (!tempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tpo001', { id: body._id }),
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
            const parentOrg = await BCMSRepo.templateOrganizer.findById(
              body.parentId,
            );
            if (!parentOrg) {
              throw errorHandler.occurred(
                HTTPStatus.NOT_FOUNT,
                bcmsResCode('tpo001', { id: body.parentId }),
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
              bcmsResCode('g003'),
            );
          }
          const updatedTempOrg = await BCMSRepo.templateOrganizer.update(
            tempOrg,
          );
          if (!updatedTempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tpo002'),
            );
          }
          await BCMSSocketManager.emit.templateOrganizer({
            templateOrganizerId: updatedTempOrg._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: updatedTempOrg,
          };
        },
      }),
      deleteById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler, accessToken }) {
          const tempOrg = await BCMSRepo.templateOrganizer.findById(
            request.params.id,
          );
          if (!tempOrg) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tpo001', { id: request.params.id }),
            );
          }
          const deleteResult = await BCMSRepo.templateOrganizer.deleteById(
            request.params.id,
          );
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tpo004'),
            );
          }
          await BCMSSocketManager.emit.templateOrganizer({
            templateOrganizerId: tempOrg._id,
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
