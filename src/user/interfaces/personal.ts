import { ObjectSchema } from '@becomes/purple-cheetah';

export interface UserPersonal {
  firstName: string;
  lastName: string;
  avatarUri: string;
}

export const UserPersonalSchema: ObjectSchema = {
  firstName: {
    __type: 'string',
    __required: true,
  },
  lastName: {
    __type: 'string',
    __required: true,
  },
  avatarUri: {
    __type: 'string',
    __required: true,
  },
};
