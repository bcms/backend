import { BCMSSocketEntrySyncManager } from '@bcms/socket';
import { BCMSRouteProtection } from '@bcms/util';
import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import { HTTPStatus } from '@becomes/purple-cheetah/types';

export const BCMSSocketController = createController({
  name: 'Socket controller',
  path: '/api/socket/calls',
  methods() {
    return {
      getEntrySyncListeners: createControllerMethod<
        unknown,
        { items: string[] }
      >({
        path: '/entry-sync',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          let pathQuery = '';
          try {
            pathQuery = Buffer.from(request.query.path + '', 'hex').toString();
          } catch (error) {
            const err = error as Error;
            errorHandler.occurred(HTTPStatus.BAD_REQUEST, err.message);
          }
          return {
            items: BCMSSocketEntrySyncManager.groups[pathQuery]
              ? Object.keys(BCMSSocketEntrySyncManager.groups[pathQuery])
              : [],
          };
        },
      }),
    };
  },
});
