import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSColor,
  BCMSColorCreateData,
  BCMSColorCreateDataSchema,
  BCMSColorUpdateData,
  BCMSColorUpdateDataSchema,
  BCMSJWTAndBodyCheckerRouteProtectionResult,
  BCMSSocketEventType,
  BCMSUserCustomPool,
} from '@bcms/types';
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

interface Setup {
  stringUtil: StringUtility;
}

export const BCMSColorController = createController<Setup>({
  name: 'Color controller',
  path: '/api/color',
  setup() {
    return {
      stringUtil: useStringUtility(),
    };
  },
  methods({ stringUtil }) {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSColor[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            items: await BCMSRepo.color.findAll(),
          };
        },
      }),
      getMany: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSColor[] }
      >({
        path: '/many',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          const ids = (request.headers['x-bcms-ids'] as string).split('-');
          if (ids[0] && ids[0].length === 24) {
            return {
              items: await BCMSRepo.color.findAllById(ids),
            };
          } else {
            return {
              items: await BCMSRepo.color.methods.findAllByCid(ids),
            };
          }
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
            count: await BCMSRepo.color.count(),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { item: BCMSColor }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const id = request.params.id;
          const color =
            id.length === 24
              ? await BCMSRepo.color.findById(id)
              : await BCMSRepo.color.methods.findByCid(id);
          if (!color) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('col001', { id }),
            );
          }
          return {
            item: color,
          };
        },
      }),
      create: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSColorCreateData>,
        { item: BCMSColor }
      >({
        type: 'post',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSColorCreateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          let idc = await BCMSRepo.idc.methods.findAndIncByForId('color');
          if (!idc) {
            const colorIdc = BCMSFactory.idc.create({
              count: 2,
              forId: 'color',
              name: 'Color',
            });
            const addIdcResult = await BCMSRepo.idc.add(colorIdc);
            if (!addIdcResult) {
              throw errorHandler.occurred(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Failed to add IDC to the database.',
              );
            }
            idc = 1;
          }
          if (!body.source.id) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              'The value of the color origin is not entered',
            );
          }
          if (body.source.type === 'group') {
            const group = await BCMSRepo.group.findById(body.source.id);
            if (!group) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('grp001', { id: body.source.id }),
              );
            }
          } else if (body.source.type === 'widget') {
            const widget = await BCMSRepo.widget.findById(body.source.id);
            if (!widget) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('wid001', { id: body.source.id }),
              );
            }
          } else if (body.source.type === 'template') {
            const template = await BCMSRepo.template.findById(body.source.id);
            if (!template) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('tmp001', { id: body.source.id }),
              );
            }
          } else {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              'The value of the color origin is not entered',
            );
          }
          const checkHex = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/g;
          if (!body.value.match(checkHex)) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('col010'),
            );
          }
          const color = BCMSFactory.color.create({
            cid: idc.toString(16),
            label: body.label,
            name: stringUtil.toSlugUnderscore(body.label),
            value: body.value,
            userId: accessToken.payload.userId,
            source: {
              id: body.source.id,
              type: body.source.type,
            },
          });
          const addedColor = await BCMSRepo.color.add(color);
          if (!addedColor) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('grp003'),
            );
          }
          await BCMSSocketManager.emit.color({
            colorId: addedColor._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedColor,
          };
        },
      }),
      update: createControllerMethod<
        BCMSJWTAndBodyCheckerRouteProtectionResult<BCMSColorUpdateData>,
        { item: BCMSColor }
      >({
        type: 'put',
        preRequestHandler: createJwtAndBodyCheckRouteProtection({
          roleNames: [JWTRoleName.ADMIN, JWTRoleName.USER],
          permissionName: JWTPermissionName.WRITE,
          bodySchema: BCMSColorUpdateDataSchema,
        }),
        async handler({ errorHandler, body, accessToken }) {
          const color = await BCMSRepo.color.findById(body._id);
          if (!color) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('col001', { id: body._id }),
            );
          }
          let changeDetected = false;
          if (typeof body.label === 'string' && body.label !== color.label) {
            changeDetected = true;
            color.label = body.label;
            color.name = stringUtil.toSlugUnderscore(body.label);
          }
          if (typeof body.value === 'string' && body.value !== color.value) {
            const checkHex = /^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$/g;
            if (!body.value.match(checkHex)) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('col010'),
              );
            }
            changeDetected = true;
            color.value = body.value;
          }
          if (!changeDetected) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('g003'),
            );
          }
          const updatedColor = await BCMSRepo.color.update(color);
          if (!updatedColor) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('col005'),
            );
          }
          await BCMSSocketManager.emit.color({
            colorId: updatedColor._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: updatedColor,
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
          [JWTRoleName.ADMIN],
          JWTPermissionName.DELETE,
        ),
        async handler({ request, errorHandler, accessToken }) {
          const color = await BCMSRepo.color.findById(request.params.id);
          if (!color) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('col001', { id: request.params.id }),
            );
          }
          const deleteResult = await BCMSRepo.color.deleteById(
            request.params.id,
          );
          if (!deleteResult) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('col006'),
            );
          }
          await BCMSSocketManager.emit.color({
            colorId: color._id,
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