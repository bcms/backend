import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddLanguageData {
  code: string;
  name: string;
  nativeName: string;
}

export const AddLanguageDataSchema: ObjectSchema = {
  code: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: true,
  },
  nativeName: {
    __type: 'string',
    __required: true,
  },
};
