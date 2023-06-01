import type {
  DocObject,
  DocSecurityItem,
  ObjectSchema,
} from '@becomes/purple-cheetah/types';
import {
  BCMSApiKeyAccessFSDBSchema,
  BCMSApiKeyAddDataSchema,
  BCMSApiKeyFSDBSchema,
  BCMSApiKeyUpdateDataSchema,
  BCMSProtectedUserSchema,
  BCMSUserUpdateDataSchema,
} from './types';
import { createDocObject } from '@becomes/purple-cheetah';
import {
  BCMSBackupCreateBodySchema,
  BCMSBackupDeleteBodySchema,
  BCMSBackupListItemSchema,
  BCMSBackupRestoreEntitiesBodySchema,
} from './backup';
import {
  BCMSChangeGetInfoDataPropSchema,
  BCMSChangeGetInfoDataSchema,
} from './change';

export const BCMSDocComponentSchemas = {
  // Change
  BCMSChangeGetInfoDataProp: BCMSChangeGetInfoDataPropSchema,
  BCMSChangeGetInfoData: BCMSChangeGetInfoDataSchema,
  // Backup
  BCMSBackupCreateBody: BCMSBackupCreateBodySchema,
  BCMSBackupDeleteBody: BCMSBackupDeleteBodySchema,
  BCMSBackupRestoreEntitiesBody: BCMSBackupRestoreEntitiesBodySchema,
  BCMSBackupListItem: BCMSBackupListItemSchema,
  BCMSBackupListItemItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSBackupListItemSchema,
    },
  } as ObjectSchema,
  BCMSBackupListItemItems: {
    items: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSBackupListItemSchema,
      },
    },
  } as ObjectSchema,
  // User
  BCMSProtectedUser: BCMSProtectedUserSchema,
  BCMSProtectedUserItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSProtectedUserSchema,
    },
  } as ObjectSchema,
  BCMSProtectedUserItems: {
    items: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSProtectedUserSchema,
      },
    },
  } as ObjectSchema,
  BCMSUserUpdateData: BCMSUserUpdateDataSchema,
  // API Key
  BCMSApiKeyAccess: BCMSApiKeyAccessFSDBSchema,
  BCMSApiKey: BCMSApiKeyFSDBSchema,
  BCMSApiKeyItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSApiKeyFSDBSchema,
    },
  } as ObjectSchema,
  BCMSApiKeyItems: {
    items: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSApiKeyFSDBSchema,
      },
    },
  } as ObjectSchema,
  BCMSApiKeyAddData: BCMSApiKeyAddDataSchema,
  BCMSApiKeyUpdateData: BCMSApiKeyUpdateDataSchema,
};

export type BCMSDocComponents = typeof BCMSDocComponentSchemas;

export const BCMSDocSecuritySchemas: {
  AccessToken: DocSecurityItem;
  RefreshToken: DocSecurityItem;
  ApiKey: DocSecurityItem;
} = {
  AccessToken: {
    inputNames: ['accessToken'],
    handler: async (inputs, res) => {
      console.log({ inputs, res });
    },
  },
  RefreshToken: {
    inputNames: ['refreshToken'],
    handler: async (inputs, res) => {
      console.log({ inputs, res });
    },
  },
  ApiKey: {
    inputNames: ['id', 'secret'],
    handler: async (inputs, res) => {
      console.log({ inputs, res });
    },
  },
};

export type BCMSDocSecurity = typeof BCMSDocSecuritySchemas;

export function bcmsCreateDocObject(
  data: DocObject<BCMSDocComponents, BCMSDocSecurity>,
): DocObject {
  return createDocObject(data);
}
