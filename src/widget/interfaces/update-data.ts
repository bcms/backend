import { PropChange, PropChangeSchema } from '../../prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateWidgetData {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: PropChange[];
}

export const UpdateWidgetDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  desc: {
    __type: 'string',
    __required: false,
  },
  propChanges: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: PropChangeSchema,
    },
  },
};
