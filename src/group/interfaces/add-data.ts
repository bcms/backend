import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddGroupData {
  label: string;
  desc: string;
}

export const AddGroupDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
};
