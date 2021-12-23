import type { BCMSUserCustomPool } from '@bcms/types';
// import type { SearchResult } from "@bcms/types/search";
import { BCMSSearchAll } from '@bcms/util';
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

export const BCMSSearchController = createController({
  name: 'Search controller',
  path: '/api/search',
  methods() {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<BCMSUserCustomPool>,
        { items: any }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ request }) {
          console.log("kk")
          const term = request.query.term as string;
          return {
            items: BCMSSearchAll.search(term),
          };
        },
      }),
    };
  },
});
