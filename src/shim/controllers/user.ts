import {
  createController,
  createControllerMethod,
  createJwtProtectionPreRequestHandler,
} from '@becomes/purple-cheetah';
import {
  HTTPStatus,
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah/types';
import { useBcmsShimService } from '../service';
import type {
  BCMSShimInstanceUser,
  BCMSShimService,
  ResponseCode,
} from '../../types';
import { useResponseCode } from '../../response-code';

export const BCMSShimUserController = createController<{
  shimService: BCMSShimService;
  resCode: ResponseCode;
}>({
  name: 'Shim user controller',
  path: '/api/shim/user',
  setup() {
    return {
      shimService: useBcmsShimService(),
      resCode: useResponseCode(),
    };
  },
  methods({ shimService, resCode }) {
    return {
      getAll: createControllerMethod({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.ADMIN, JWTRoleName.USER],
          JWTPermissionName.READ,
        ),
        async handler({ errorHandler }) {
          return await shimService.send({
            uri: '/instance/user/all',
            payload: {},
            errorHandler,
          });
        },
      }),
      verifyOtp: createControllerMethod({
        path: '/verify/otp',
        type: 'post',
        async handler({ request, errorHandler }) {
          const result: {
            ok: boolean;
            user?: BCMSShimInstanceUser;
          } = await shimService.send({
            uri: '/instance/user/verify/otp',
            payload: { otp: request.body.otp },
            errorHandler,
          });
          if (!result.ok) {
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              resCode.get('a003'),
            );
          }
        },
      }),
    };
  },
});
