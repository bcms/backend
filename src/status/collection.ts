import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSStatusCreateDataInput, BCMSStatusUpdateDataInput } from './inputs';
import { BCMSStatusObject } from './objects';
import {
  BCMSStatusCountResolver,
  BCMSStatusCreateResolver,
  BCMSStatusDeleteResolver,
  BCMSStatusGetAllResolver,
  BCMSStatusGetByIdResolver,
  BCMSStatusUpdateResolver,
} from './resolvers';

export const BCMSStatusCollection = createGraphqlCollection({
  name: 'status',
  objects: [BCMSStatusObject],
  inputs: [BCMSStatusCreateDataInput, BCMSStatusUpdateDataInput],
  resolvers: [
    BCMSStatusCountResolver,
    BCMSStatusCreateResolver,
    BCMSStatusDeleteResolver,
    BCMSStatusGetAllResolver,
    BCMSStatusGetByIdResolver,
    BCMSStatusUpdateResolver,
  ],
});
