import { Types } from 'mongoose';
import type { BCMSConfig, BCMSUser, BCMSUserFactory } from '../types';
import { useBcmsConfig } from '../config';
import {
  JWTPermissionName,
  JWTRoleName,
} from '@becomes/purple-cheetah-mod-jwt/types';

let bcmsConfig: BCMSConfig;
let userFactory: BCMSUserFactory;

export function useUserFactory(): BCMSUserFactory {
  if (!userFactory) {
    bcmsConfig = useBcmsConfig();
    userFactory = {
      create(config) {
        const user: BCMSUser = {
          _id: new Types.ObjectId(),
          createdAt: -1,
          updatedAt: -1,
          email: '',
          username: '',
          password: '',
          roles: [
            {
              name: JWTRoleName.USER,
              permissions: [
                {
                  name: JWTPermissionName.READ,
                },
                {
                  name: JWTPermissionName.WRITE,
                },
                {
                  name: JWTPermissionName.DELETE,
                },
                {
                  name: JWTPermissionName.EXECUTE,
                },
              ],
            },
          ],
          customPool: {
            personal: {
              firstName: '',
              lastName: '',
              avatarUri: '',
            },
            address: {},
            policy: {
              media: {
                get: false,
                post: false,
                put: false,
                delete: false,
              },
              templates: [],
              plugins: [],
            },
          },
        };

        if (bcmsConfig.database.fs) {
          user._id = user._id.toHexString() as never;
        }
        if (config.admin) {
          user.roles[0].name = JWTRoleName.ADMIN;
        }
        if (config.options) {
          user.username =
            config.options.firstName + ' ' + config.options.lastName;
          user.customPool.personal.firstName = config.options.firstName;
          user.customPool.personal.lastName = config.options.lastName;
          if (config.options.avatarUri) {
            user.customPool.personal.avatarUri = config.options.avatarUri;
          }
        }

        return user;
      },
      toProtected(user) {
        return JSON.parse(
          JSON.stringify({
            _id: `${user._id}`,
            email: user.email,
            roles: user.roles,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            customPool: user.customPool,
          }),
        );
      },
    };
  }
  return userFactory;
}
