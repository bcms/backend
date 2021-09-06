import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { HTTPStatus } from '@becomes/purple-cheetah/types';
import { BCMSShimService } from '..';

export const BCMSShimHealthController = createController({
  name: 'Shim health controller',
  path: '/api/shim/health',
  methods() {
    return {
      health: createControllerMethod({
        path: '',
        type: 'post',
        async handler({ request, errorHandler }): Promise<{
          heepAvailable: number;
          heepUsed: number;
        }> {
          const shimCode = request.headers.shimcode as string;
          if (!shimCode) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              'Missing important headers',
            );
          }
          if (
            process.env.BCMS_LOCAL !== 'true' &&
            shimCode !== BCMSShimService.getCode()
          ) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              'Unauthorized',
            );
          }
          BCMSShimService.refreshAvailable();
          const mem = process.memoryUsage();
          return {
            heepAvailable: mem.heapTotal,
            heepUsed: mem.heapUsed,
          };
        },
      }),
    };
  },
});
