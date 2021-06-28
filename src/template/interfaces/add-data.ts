import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddTemplateData {
  label: string;
  desc: string;
  singleEntry: boolean;
}

export const AddTemplateDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
  singleEntry: {
    __type: 'boolean',
    __required: true,
  },
};
