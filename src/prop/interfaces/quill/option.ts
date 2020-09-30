import { ObjectSchema } from '@becomes/purple-cheetah';

export interface PropQuillOption {
  insert: string;
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    list?: string;
    indent?: number;
    link?: string;
  };
}

export const PropQuillOptionSchema: ObjectSchema = {
  insert: {
    __type: 'string',
    __required: true,
  },
  attributes: {
    __type: 'object',
    __required: false,
    __child: {
      bold: {
        __type: 'boolean',
        __required: false,
      },
      italic: {
        __type: 'boolean',
        __required: false,
      },
      underline: {
        __type: 'boolean',
        __required: false,
      },
      strike: {
        __type: 'boolean',
        __required: false,
      },
      list: {
        __type: 'string',
        __required: false,
      },
      indent: {
        __type: 'number',
        __required: false,
      },
      link: {
        __type: 'string',
        __required: false,
      },
    },
  },
};
