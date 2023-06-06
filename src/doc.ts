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
  BCMSColorCreateDataSchema,
  BCMSColorFSDBSchema,
  BCMSColorUpdateDataSchema,
  BCMSEntryCreateDataSchema,
  BCMSEntryFSDBSchema,
  BCMSEntryLiteSchema,
  BCMSEntryUpdateDataSchema,
  BCMSGroupFSDBSchema,
  BCMSGroupLiteSchema,
  BCMSLanguageFSDBSchema,
  BCMSMediaFSDBSchema,
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
import { BCMSGroupWhereIsItUsedResponseSchema } from './group';

export const BCMSDocComponentSchemas = {
  // Media
  BCMSMedia: BCMSMediaFSDBSchema,
  BCMSMediaItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSMediaFSDBSchema,
    },
  } as ObjectSchema,
  BCMSMediaItems: {
    items: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSLanguageFSDBSchema,
      },
    },
  } as ObjectSchema,

  // Language
  BCMSLanguage: BCMSLanguageFSDBSchema,
  BCMSLanguageItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSLanguageFSDBSchema,
    },
  } as ObjectSchema,
  BCMSLanguageItems: {
    items: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSLanguageFSDBSchema,
      },
    },
  } as ObjectSchema,

  // Group
  BCMSGroupWhereIsItUsedResponse: BCMSGroupWhereIsItUsedResponseSchema,
  BCMSGroup: BCMSGroupFSDBSchema,
  BCMSGroupItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSGroupFSDBSchema,
    },
  } as ObjectSchema,
  BCMSGroupItems: {
    item: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSGroupFSDBSchema,
      },
    },
  } as ObjectSchema,
  BCMSGroupLite: BCMSGroupLiteSchema,
  BCMSGroupLiteItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSGroupLiteSchema,
    },
  } as ObjectSchema,
  BCMSGroupLiteItems: {
    item: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSGroupLiteSchema,
      },
    },
  } as ObjectSchema,

  // Entry
  BCMSEntryLite: BCMSEntryLiteSchema,
  BCMSEntryLiteItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSEntryLiteSchema,
    },
  } as ObjectSchema,
  BCMSEntryLiteItems: {
    item: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSEntryLiteSchema,
      },
    },
  } as ObjectSchema,
  BCMSEntry: BCMSEntryFSDBSchema,
  BCMSEntryItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSEntryFSDBSchema,
    },
  } as ObjectSchema,
  BCMSEntryItems: {
    item: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSEntryFSDBSchema,
      },
    },
  } as ObjectSchema,
  BCMSEntryCreateData: BCMSEntryCreateDataSchema,
  BCMSEntryUpdateData: BCMSEntryUpdateDataSchema,

  // Color
  BCMSColor: BCMSColorFSDBSchema,
  BCMSColorItem: {
    item: {
      __type: 'object',
      __required: true,
      __child: BCMSColorFSDBSchema,
    },
  } as ObjectSchema,
  BCMSColorItems: {
    item: {
      __type: 'array',
      __required: true,
      __child: {
        __type: 'object',
        __content: BCMSColorFSDBSchema,
      },
    },
  } as ObjectSchema,
  BCMSColorCreateData: BCMSColorCreateDataSchema,
  BCMSColorUpdateData: BCMSColorUpdateDataSchema,

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
