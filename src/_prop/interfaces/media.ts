import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropMedia {
  id: string;
  altText: string;
}

export const PropMediaSchema: ObjectSchema = {
  id: {
    __type: 'string',
    __required: true,
  },
  altText: {
    __type: 'string',
    __required: true,
  },
};
