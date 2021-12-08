import { BCMSRepo } from '@bcms/repo';
import type {
  BCMSTypeConverterResultItem,
  BCMSTypeConverterTarget,
  BCMSUserCustomPool,
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

export const BCMSTypeConverterController = createController({
  name: 'Type converter controller',
  path: '/api/type-convert',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: BCMSTypeConverterResultItem[] }
      >({
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
    };
  },
});
