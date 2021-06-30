import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropMediaData {
  id: string;
  altText: string;
}

export const BCMSPropMediaDataSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  altText: {
    __type: 'string',
    __required: true,
  },
};
