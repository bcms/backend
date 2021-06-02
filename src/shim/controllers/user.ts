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

let shimService: BCMSShimService;
let resCode: ResponseCode;

export const BCMSShimUserController = createController({
  name: 'Shim user controller',
  path: '/api/shim/user',
  methods: [
    createControllerMethod({
      path: '/all',
      name: 'get all',
      type: 'get',
      preRequestHandler: createJwtProtectionPreRequestHandler(
        [JWTRoleName.ADMIN, JWTRoleName.USER],
        JWTPermissionName.READ,
      ),
      async handler({ errorHandler }) {
        if (!shimService) {
          shimService = useBcmsShimService();
        }
        return await shimService.send({
          uri: '/instance/user/all',
          payload: {},
          errorHandler,
        });
      },
    }),
    createControllerMethod({
      path: '/verify/otp',
      name: 'verifyOtp',
      type: 'post',
      async handler({ request, errorHandler }) {
        if (!shimService) {
          shimService = useBcmsShimService();
        }
        if (!resCode) {
          resCode = useResponseCode();
        }
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
  ],
});
