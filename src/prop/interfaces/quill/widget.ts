import { ObjectSchema } from '@becomes/purple-cheetah';
import { Prop, PropSchema } from '../prop';

export interface PropWidget {
  _id: string;
  props: Prop[];
}

export const PropWidgetSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  props: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: PropSchema,
    },
  },
};
