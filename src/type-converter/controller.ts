import { BCMSRepo } from '@bcms/repo';
import { bcmsResCode } from '@bcms/response-code';
import type {
  BCMSGroup,
  BCMSTemplate,
  BCMSTypeConverterResultItem,
  BCMSTypeConverterTarget,
  BCMSUserCustomPool,
  BCMSWidget,
} from '@bcms/types';
import { BCMSTypeConverter } from '@bcms/util/type-converter';
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

export const BCMSTypeConverterController = createController({
  name: 'Type converter controller',
  path: '/api/type-converter',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTypeConverterResultItem[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          const templates = await BCMSRepo.template.findAll();
          const groups = await BCMSRepo.group.findAll();
          const widgets = await BCMSRepo.widget.findAll();

          return {
            items: await BCMSTypeConverter.typescript([
              ...templates.map((e) => {
                return {
                  name: e.name,
                  type: 'template',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
              ...templates.map((e) => {
                return {
                  name: e.name,
                  type: 'entry',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
              ...groups.map((e) => {
                return {
                  name: e.name,
                  type: 'group',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
              ...widgets.map((e) => {
                return {
                  name: e.name,
                  type: 'widget',
                  props: e.props,
                } as BCMSTypeConverterTarget;
              }),
            ]),
          };
        },
      }),
      get: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTypeConverterResultItem[] }
      >({
        path: '/:itemId/:itemType/:languageType',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const allowedTypes = ['template', 'group', 'widget', 'entry'];
          if (!allowedTypes.includes(request.params.itemType)) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              bcmsResCode('tc001', { itemType: request.params.itemType }),
            );
          }
          let item: BCMSGroup | BCMSTemplate | BCMSWidget | null = null;
          switch (request.params.itemType) {
            case 'entry':
              {
                item = await BCMSRepo.template.findById(request.params.itemId);
              }
              break;
            case 'group':
              {
                item = await BCMSRepo.group.findById(request.params.itemId);
              }
              break;
            case 'widget':
              {
                item = await BCMSRepo.widget.findById(request.params.itemId);
              }
              break;
            case 'template':
              {
                item = await BCMSRepo.template.findById(request.params.itemId);
              }
              break;
          }
          if (!item) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              bcmsResCode('tc002', { itemId: request.params.itemId }),
            );
          }

          return {
            items: await BCMSTypeConverter.typescript([
              {
                name: item.name,
                type: 'entry',
                props: item.props,
              },
            ]),
          };
        },
      }),
    };
  },
});
