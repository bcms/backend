import {
  createController,
  createControllerMethod,
  createJwtProtectionPreRequestHandler,
} from '@becomes/purple-cheetah';
import { JWTPermissionName, JWTRoleName } from '@becomes/purple-cheetah/types';
import { useUserRepo } from './repository';

export const UserController = createController({
  name: 'User controller',
  path: '/api/user',
  setup() {
    return {
      repo: useUserRepo(),
      test: '',
    };
  },
  methods: [
    {
      path: '/count',
      name: 'count',
      type: 'get',
      preRequestHandler: createJwtProtectionPreRequestHandler(
        [JWTRoleName.ADMIN, JWTRoleName.USER],
        JWTPermissionName.READ,
      ),
      async handler({}) {},
    },
  ],
});
