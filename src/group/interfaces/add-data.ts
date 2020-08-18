import { Prop, PropSchema } from '../../prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddGroupData {
  name: string;
  desc: string;
}

export const AddGroupDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
};
