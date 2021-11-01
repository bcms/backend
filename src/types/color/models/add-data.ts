import type { BCMSColorSourceType } from '@bcms/types';
import type { ObjectSchema } from '@becomes/purple-cheetah/types';

export interface BCMSColorCreateData {
  label: string;
  value: string;
  source: {
    id: string;
    type: BCMSColorSourceType;
  };
}

export const BCMSColorCreateDataSchema: ObjectSchema = {
  label: {
    __type: 'string',
    __required: true,
  },
  value: {
    __type: 'string',
    __required: true,
  },
  source: {
    __type: 'object',
    __required: true,
    __child: {
      id: {
        __type: 'string',
        __required: true,
      },
      type: {
        __type: 'string',
        __required: true,
      },
    },
  },
};
