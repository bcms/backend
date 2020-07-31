import { ObjectSchema } from '@becomes/purple-cheetah';

export interface AddUserData {
  email: string;
  password: string;
  customPool: {
    personal: {
      firstName: string;
      lastName: string;
    };
  };
}

export const AddUserDataSchema: ObjectSchema = {
  email: {
    __type: 'string',
    __required: true,
  },
  password: {
    __type: 'string',
    __required: true,
  },
  customPool: {
    __type: 'object',
    __required: true,
    __child: {
      personal: {
        __type: 'object',
        __required: true,
        __child: {
          firstName: {
            __type: 'string',
            __required: true,
          },
          lastName: {
            __type: 'string',
            __required: true,
          },
        },
      },
    },
  },
};
