import { ObjectSchema } from '@becomes/purple-cheetah';

export interface RefreshToken {
  value: string;
  expAt: number;
}

export const RefreshTokenSchema: ObjectSchema = {
  value: {
    __type: 'string',
    __required: true,
  },
  expAt: {
    __type: 'number',
    __required: true,
  },
};
