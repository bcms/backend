import { BCMSFactory } from '@bcms/factory';
import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import { BCMSSocketManager } from '@bcms/socket';
import {
  BCMSColorCreateData,
  BCMSColorCreateDataSchema,
  BCMSSocketEventType,
} from '@bcms/types';
import {
  createController,
  createControllerMethod,
  useStringUtility,
} from '@becomes/purple-cheetah';

import {
  JWTPermissionName,
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
      create: createControllerMethod({
        type: 'post',
        preRequestHandler:
          createJwtAndBodyCheckRouteProtection<BCMSColorCreateData>({
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
          if (body.source.type.match('group')) {
            const group = await BCMSRepo.group.findById(body.source.id);
            if (!group) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('grp001', { id: body.source.id }),
              );
            }
          } else if (body.source.type.match('widget')) {
            const widget = await BCMSRepo.widget.findById(body.source.id);
            if (!widget) {
              throw errorHandler.occurred(
                HTTPStatus.BAD_REQUEST,
                bcmsResCode('wid001', { id: body.source.id }),
              );
            }
          } else if (body.source.type.match('template')) {
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

          const checkHex = /^#[0-9A-Fa-f]{6}/g;
          if (!(await body.value.match(checkHex))) {
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

          if (await BCMSRepo.color.methods.findByName(color.name)) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              bcmsResCode('col002', { name: color.name }),
            );
          }
          const addedColor = await BCMSRepo.color.add(color);
          if (!addedColor) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              bcmsResCode('grp003'),
            );
          }
          await BCMSSocketManager.emit.group({
            groupId: addedColor._id,
            type: BCMSSocketEventType.UPDATE,
            userIds: 'all',
            excludeUserId: [accessToken.payload.userId],
          });
          return {
            item: addedColor,
          };
        },
      }),
    };
  },
});
