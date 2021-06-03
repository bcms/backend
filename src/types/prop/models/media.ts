import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropMedia {
  id: string;
  altText: string;
}

export const BCMSPropMediaSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  altText: {
    __type: 'string',
    __required: true,
  },
};
