import { Types } from 'mongoose';
import { JWTPermissionName, JWTRoleName } from '@becomes/purple-cheetah/types';
import type { BCMSConfig, UserFSDB, UserMongoDB } from '../types';
import { useBcmsConfig } from '../config';

let bcmsConfig: BCMSConfig;

export function userFactory(config: {
  admin: boolean;
  options?: {
    email: string;
    firstName: string;
    lastName: string;
    avatarUri?: string;
  };
}): UserMongoDB | UserFSDB {
  if (!bcmsConfig) {
    bcmsConfig = useBcmsConfig();
  }

  const user: UserMongoDB | UserFSDB = {
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
        customPortal: {
          get: false,
          post: false,
          put: false,
          delete: false,
        },
        templates: [],
        webhooks: [],
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
    user.username = config.options.firstName + ' ' + config.options.lastName;
    user.customPool.personal.firstName = config.options.firstName;
    user.customPool.personal.lastName = config.options.lastName;
    if (config.options.avatarUri) {
      user.customPool.personal.avatarUri = config.options.avatarUri;
    }
  }

  return user;
}
