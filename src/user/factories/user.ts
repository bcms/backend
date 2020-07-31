import { FSUser, User, ProtectedUser } from '../models';
import { Types } from 'mongoose';
import { RoleName, PermissionName } from '@becomes/purple-cheetah';

export class UserFactory {
  static get instance(): User | FSUser {
    if (process.env.DB_USE_FS) {
      return new FSUser(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        [],
        [],
        {
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
            entries: [],
            webhooks: [],
          },
        },
      );
    } else {
      return new User(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        '',
        '',
        '',
        [],
        [],
        {
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
            entries: [],
            webhooks: [],
          },
        },
      );
    }
  }

  static admin(config: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUri?: string;
  }): User | FSUser {
    if (process.env.DB_USE_FS) {
      return new FSUser(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        config.username,
        config.email,
        '',
        [
          {
            name: RoleName.ADMIN,
            permissions: [
              {
                name: PermissionName.READ,
              },
              {
                name: PermissionName.WRITE,
              },
              {
                name: PermissionName.DELETE,
              },
              {
                name: PermissionName.EXECUTE,
              },
            ],
          },
        ],
        [],
        {
          personal: {
            firstName: config.firstName,
            lastName: config.lastName,
            avatarUri: config.avatarUri || '',
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
            entries: [],
            webhooks: [],
          },
        },
      );
    } else {
      return new User(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        config.username,
        config.email,
        '',
        [
          {
            name: RoleName.ADMIN,
            permissions: [
              {
                name: PermissionName.READ,
              },
              {
                name: PermissionName.WRITE,
              },
              {
                name: PermissionName.DELETE,
              },
              {
                name: PermissionName.EXECUTE,
              },
            ],
          },
        ],
        [],
        {
          personal: {
            firstName: config.firstName,
            lastName: config.lastName,
            avatarUri: config.avatarUri || '',
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
            entries: [],
            webhooks: [],
          },
        },
      );
    }
  }

  static user(config: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUri?: string;
  }): User | FSUser {
    if (process.env.DB_USE_FS) {
      return new FSUser(
        new Types.ObjectId().toHexString(),
        Date.now(),
        Date.now(),
        config.username,
        config.email,
        '',
        [
          {
            name: RoleName.USER,
            permissions: [
              {
                name: PermissionName.READ,
              },
              {
                name: PermissionName.WRITE,
              },
              {
                name: PermissionName.DELETE,
              },
              {
                name: PermissionName.EXECUTE,
              },
            ],
          },
        ],
        [],
        {
          personal: {
            firstName: config.firstName,
            lastName: config.lastName,
            avatarUri: config.avatarUri || '',
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
            entries: [],
            webhooks: [],
          },
        },
      );
    } else {
      return new User(
        new Types.ObjectId(),
        Date.now(),
        Date.now(),
        config.username,
        config.email,
        '',
        [
          {
            name: RoleName.USER,
            permissions: [
              {
                name: PermissionName.READ,
              },
              {
                name: PermissionName.WRITE,
              },
              {
                name: PermissionName.DELETE,
              },
              {
                name: PermissionName.EXECUTE,
              },
            ],
          },
        ],
        [],
        {
          personal: {
            firstName: config.firstName,
            lastName: config.lastName,
            avatarUri: config.avatarUri || '',
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
            entries: [],
            webhooks: [],
          },
        },
      );
    }
  }

  static removeProtected(user: User | FSUser): ProtectedUser {
    const u = JSON.parse(JSON.stringify(user));
    delete u.password;
    delete u.refreshTokens;
    return JSON.parse(JSON.stringify(u));
  }
}
