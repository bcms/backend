import { ObjectSchema } from '@becomes/purple-cheetah';
import { PropQuillOption, PropQuillOptionSchema } from './option';

export interface PropQuill {
  text: string;
  ops: PropQuillOption[];
}

export const PropQuillSchema: ObjectSchema = {
  text: {
    __type: 'string',
    __required: true,
  },
  ops: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: PropQuillOptionSchema,
    },
  },
};
