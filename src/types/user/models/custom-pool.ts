import type { ObjectSchema } from '@becomes/purple-cheetah/types';
import { UserPersonal, UserPersonalSchema } from './personal';
import { UserAddress, UserAddressSchema } from './address';
import { UserPolicy, UserPolicySchema } from './policy';

export interface UserCustomPool {
  personal: UserPersonal;
  address: UserAddress;
  policy: UserPolicy;
}

export const UserCustomPoolSchema: ObjectSchema = {
  personal: {
    __type: 'object',
    __required: true,
    __child: UserPersonalSchema,
  },
  address: {
    __type: 'object',
    __required: true,
    __child: UserAddressSchema,
  },
  policy: {
    __type: 'object',
    __required: true,
    __child: UserPolicySchema,
  },
};
