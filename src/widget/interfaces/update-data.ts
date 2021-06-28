import { PropChange, PropChangeSchema } from '../../_prop';
import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UpdateWidgetData {
  _id: string;
  label?: string;
  desc?: string;
  propChanges?: PropChange[];
  previewImage?: string;
  previewScript?: string;
  previewStyle?: string;
}

export const UpdateWidgetDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  label: {
    __type: 'string',
    __required: false,
  },
  desc: {
    __type: 'string',
    __required: false,
  },
  propChanges: {
    __type: 'array',
    __required: false,
    __child: {
      __type: 'object',
      __content: PropChangeSchema,
    },
  },
  previewImage: {
    __type: 'string',
    __required: false,
  },
  previewScript: {
    __type: 'string',
    __required: false,
  },
  previewStyle: {
    __type: 'string',
    __required: false,
  },
};
