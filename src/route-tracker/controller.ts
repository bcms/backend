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

export const RouteTracker: {
  [userId: string]: string;
} = {};

export const RouteTrackerController = createController({
  name: 'Route tracker controller',
  path: '/api/route-tracker',
  methods() {
    return {
      register: createControllerMethod({
        path: '/register',
        type: 'post',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.WRITE,
        ),
        async handler({ request, accessToken, errorHandler }) {
          const sid = request.headers['x-bcms-sid'] as string;
          if (!sid) {
            throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, 'Missing SID');
          }
          const path = Buffer.from(request.query.path + '', 'hex').toString();
          RouteTracker[`${accessToken.payload.userId}_${sid}`] = path;
          return {
            ok: true,
          };
        },
      }),

      getUserAtPath: createControllerMethod({
        path: '/get-users',
        type: 'get',
        preRequestHandler: BCMSRouteProtection.createJwtPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request, accessToken }) {
          const sid = request.headers['x-bcms-sid'] as string;
          const path = Buffer.from(request.query.path + '', 'hex').toString();
          const items: string[] = [];
          const myConnId = `${accessToken.payload.userId}_${sid}`;
          for (const connId in RouteTracker) {
            if (connId !== myConnId && RouteTracker[connId] === path) {
              items.push(connId);
            }
          }
          return { items };
        },
      }),
    };
  },
});
