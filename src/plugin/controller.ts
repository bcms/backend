import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { useBcmsPluginManager } from './main';
import type { BCMSPluginManager } from '../types';

interface Setup {
  pluginManager: BCMSPluginManager;
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
      getList: createControllerMethod({
        path: '/list',
        type: 'get',
        async handler() {
          return { items: pluginManager.getList() };
        },
      }),
    };
  },
});
