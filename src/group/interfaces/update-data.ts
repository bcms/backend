import { PropChange, PropChangeSchema } from '../../prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateGroupData {
  _id: string;
  name?: string;
  desc?: string;
  propChanges?: PropChange[];
}

export const UpdateGroupData: ObjectSchema = {
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
  propChanges: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: PropChangeSchema,
    },
  },
};
