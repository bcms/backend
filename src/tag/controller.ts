import { BCMSPropHandler } from '@bcms/prop';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
import {
  BCMSTag,
  BCMSTagCreateData,
  BCMSTagCreateDataSchema,
  BCMSTagUpdateData,
  BCMSTagUpdateDataSchema,
} from '@bcms/types/tag';
import { createJwtAndBodyCheckRouteProtection } from '@bcms/util';
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
import { BCMSTagRequestHandler } from './request-handler';

export const BCMSTagController = createController({
  name: 'Tag controller',
  path: '/api/tag',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTag[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSTagRequestHandler.getAll(),
          };
        },
      }),
      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTag[] }
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
            items: await BCMSTagRequestHandler.getMany(ids),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTag }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSTagRequestHandler.getById({
              id: request.params.id,
              errorHandler,
            }),
          };
        },
      }),
      getByValue: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSTag }
      >({
        path: '/value/:value',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          return {
            item: await BCMSTagRequestHandler.getByValue({
              value: request.params.value,
              errorHandler,
            }),
          };
        },
      }),
      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTagCreateData>,
        { item: BCMSTag }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSTagCreateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          return {
            item: await BCMSTagRequestHandler.create({
              accessToken,
              errorHandler,
              body,
            }),
          };
        },
      }),
      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSTagUpdateData>,
        { item: BCMSTag }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSTagUpdateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          if (body.value === '') {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('tag009'),
            );
          }
          const tag = await BCMSRepo.tag.findById(body._id);
          if (!tag) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tag001', { id: body._id }),
            );
          }
          const existTag = await BCMSRepo.tag.methods.findByValue(body.value);
          if (existTag) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('tag002', { value: body.value }),
            );
          }
          let changeDetected = false;
          if (typeof body.value === 'string' && body.value !== tag.value) {
            changeDetected = true;
            tag.value = body.value;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('g003'),
            );
          }
          const updatedTag = await BCMSRepo.tag.update(tag);
          if (!updatedTag) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tag005'),
            );
          }
          await BCMSSocketManager.emit.tag({
            tagId: updatedTag._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('tag');
          return {
            item: updatedTag,
          };
        },
      }),
      delete: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { message: 'Success.' }
      >({
        path: '/:id',
        type: 'delete',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken, logger, name }) {
          const tag = await BCMSRepo.tag.findById(request.params.id);
          if (!tag) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tag001', { id: request.params.id }),
            );
          }
          const deleteTag = await BCMSRepo.tag.deleteById(request.params.id);
          if (!deleteTag) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('tag006'),
            );
          }
          const errors = await BCMSPropHandler.removeTag({
            tagId: tag._id,
          });
          if (errors) {
            logger.error(name, errors);
          }
          await BCMSSocketManager.emit.tag({
            tagId: tag._id,
            type: BCMSSocketEventType.REMOVE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          await BCMSRepo.change.methods.updateAndIncByName('tag');
          return {
            message: 'Success.',
          };
        },
      }),
    };
  },
});
