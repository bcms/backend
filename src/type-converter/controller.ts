import { BCMSRepo } from '@bcms/repo';
import type {
  BCMSTypeConverterResultItem,
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
          const typeConverted: BCMSTypeConverterResultItem[] = [];
          const templates = await BCMSRepo.template.findAll();
          for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            typeConverted.push(
              ...(await BCMSTypeConverter.typescript({
                target: template,
                type: 'template',
              })),
            );
          }
          const groups = await BCMSRepo.group.findAll();
          for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            typeConverted.push(
              ...(await BCMSTypeConverter.typescript({
                target: group,
                type: 'group',
              })),
            );
          }
          const widgets = await BCMSRepo.widget.findAll();
          for (let i = 0; i < widgets.length; i++) {
            const widget = widgets[i];
            typeConverted.push(
              ...(await BCMSTypeConverter.typescript({
                target: widget,
                type: 'widget',
              })),
            );
          }
          return {
            items: typeConverted,
          };
        },
      }),
    };
  },
});
