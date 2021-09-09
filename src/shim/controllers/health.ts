import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { BCMSShimService } from '..';

export const BCMSShimHealthController = createController({
  name: 'Shim health controller',
  path: '/api/shim/calls/health',
  methods() {
    return {
      health: createControllerMethod<unknown, { ok: boolean }>({
        path: '',
        type: 'post',
        async handler() {
          BCMSShimService.refreshAvailable();
          return {
            ok: true,
          };
        },
      }),
    };
  },
});
