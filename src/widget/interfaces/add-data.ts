import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddWidgetData {
  label: string;
  desc: string;
}

export const AddWidgetDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  desc: {
    __type: 'string',
    __required: true,
  },
};
