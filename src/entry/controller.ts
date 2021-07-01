import {
  createController,
  createControllerMethod,
} from '@becomes/purple-cheetah';
import { createJwtProtectionPreRequestHandler } from '@becomes/purple-cheetah-mod-jwt';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';
import type { BCMSUserCustomPool } from '../types';
import { useBcmsEntryRepository } from './repository';
import type { BCMSEntryFactory, BCMSEntryRepository } from './types';

interface Setup {
  entryRepo: BCMSEntryRepository;
  entryFactory: BCMSEntryFactory;
}

export const BCMSEntryController = createController<Setup>({
  name: 'Entry controller',
  path: '/api/entry',
  setup() {
    return {
      entryRepo: useBcmsEntryRepository(),
    };
  },
  methods({ entryRepo, entryFactory }) {
    return {
      getManyLiteById: createControllerMethod({
        path: '/many/lite/:ids',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          const ids = request.params.ids.split('-');
          return {
            items: await entryRepo.findAllById(ids),
          };
        },
      }),

      getAllByTemplateId: createControllerMethod({
        path: '/all/:tempId',
        type: 'get',
        preRequestHandler:
          createJwtProtectionPreRequestHandler<BCMSUserCustomPool>(
            [JWTRoleName.ADMIN, JWTRoleName.USER],
            JWTPermissionName.READ,
          ),
        async handler({ request }) {
          return {
            items: await entryRepo.methods.findAllByTemplateId(
              request.params.tempId,
            ),
          };
        },
      }),
    };
  },
});
