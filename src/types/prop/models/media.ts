import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSPropMetaValueMedia {
  id: string;
  altText: string;
}

export const BCMSPropMetaValueMediaSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  altText: {
    __type: 'string',
    __required: true,
  },
};

export interface BCMSPropContentValueMedia {
  id: string;
  altText: string;
}

export const BCMSPropContentValueMediaSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  altText: {
    __type: 'string',
    __required: true,
  },
};
