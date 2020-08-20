import { ApiKeyAccess, ApiKeyAccessSchema } from '../models';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateApiKeyData {
  _id: string;
  name?: string;
  desc?: string;
  blocked?: boolean;
  access?: ApiKeyAccess;
}

export const UpdateApiKeyDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: false,
  },
  desc: {
    __type: 'string',
    __required: false,
  },
  blocked: {
    __type: 'boolean',
    __required: false,
  },
  access: {
    __type: 'object',
    __required: false,
    __child: ApiKeyAccessSchema,
  },
};
