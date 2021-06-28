import { PropChange, PropChangeSchema } from '../../_prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateGroupData {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: PropChange[];
}

export const UpdateGroupDataSchema: ObjectSchema = {
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
