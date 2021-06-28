import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateLanguageData {
  _id: string;
  def?: boolean;
}

export const UpdateLanguageDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: false,
  },
  def: {
    __type: 'boolean',
    __required: false,
  },
};
