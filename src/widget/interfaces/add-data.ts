import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddWidgetData {
  name: string;
  desc: string;
}

export const AddWidgetDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
};
