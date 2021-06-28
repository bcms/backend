import { ApiKeyAccess, ApiKeyAccessSchema } from '../models';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddApiKeyData {
  name: string;
  desc: string;
  blocked: boolean;
  access: ApiKeyAccess;
}

export const AddApiKeyDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  blocked: {
    __type: 'boolean',
    __required: true,
  },
  access: {
    __type: 'object',
    __required: true,
    __child: ApiKeyAccessSchema,
  },
};
