import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddTemplateData {
  name: string;
  desc: string;
  singleEntry: boolean;
}

export const AddTemplateDataSchema: ObjectSchema = {
  name: {
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
