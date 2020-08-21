import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddMediaDirData {
  name: string;
  parentId?: string;
}

export const AddMediaDirDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  parentId: {
    __type: 'string',
    __required: false,
  },
};
