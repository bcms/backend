import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateMediaData {
  _id: string;
  name?: string;
  /** ID of the parent dir or `root`. */
  moveTo?: string;
}

export const UpdateMediaDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: false,
  },
  move: {
    __type: 'string',
    __required: false,
  },
};
