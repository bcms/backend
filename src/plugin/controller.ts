import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { useBcmsPluginManager } from './main';
import type { BCMSPluginManager, BCMSPluginPolicy } from '../types';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';

interface Setup {
  pluginManager: BCMSPluginManager;
}
interface GetPolicyItem {
  name: string;
  policies: BCMSPluginPolicy[];
}

export const BCMSPluginController = createController<Setup>({
  name: 'Plugin controller',
  path: '/api/plugin',
  setup() {
    return {
      pluginManager: useBcmsPluginManager(),
    };
  },
  methods({ pluginManager }) {
    return {
      getList: createControllerMethod<
        unknown,
        {
          items: string[];
        }
      >({
        path: '/list',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          return { items: pluginManager.getList() };
        },
      }),
      getPolicies: createControllerMethod<
        unknown,
        {
          items: GetPolicyItem[];
        }
      >({
        path: '/list/policy',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler() {
          const plugins = pluginManager.getListInfo();
          const items: GetPolicyItem[] = [];
          for (let i = 0; i < plugins.length; i++) {
            const plugin = plugins[i];
            items.push({
              name: plugin.name,
              policies: [
                {
                  type: 'checkbox',
                  name: 'can_edit_projects',
                  default: [''],
                },
                {
                  type: 'input',
                  name: 'build_limit',
                },
                {
                  type: 'inputArray',
                  name: 'roles',
                },
                {
                  type: 'select',
                  name: 'primary_build',
                  options: ['Productions', 'Staging'],
                },
                {
                  type: 'selectArray',
                  name: 'allowed_to_build',
                  options: ['Production', 'Staging', 'Preview'],
                },
              ], //await plugin.policy(),
            });
          }
          return { items };
        },
      }),
    };
  },
});
