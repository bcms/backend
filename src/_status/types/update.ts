import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateStatusData {
  _id: string;
  label?: string;
  color?: string;
}

export const UpdateStatusDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  color: {
    __type: 'string',
    __required: false,
  },
};
