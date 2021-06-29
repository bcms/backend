import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddStatusData {
  label: string;
  color?: string;
}

export const AddStatusDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  color: {
    __type: 'string',
    __required: false,
  },
};
