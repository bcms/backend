import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSStatusCreateDataInput, BCMSStatusUpdateDataInput } from './inputs';
import { BCMSStatusObject } from './objects';
import {
  BCMSStatusCountResolver,
  BCMSStatusCreateResolver,
  BCMSStatusGetAllResolver,
  BCMSStatusGetByIdResolver,
} from './resolvers';
import { BCMSStatusUpdateResolver } from './resolvers/update';

export const BCMSStatusCollection = createGraphqlCollection({
  name: 'status',
  objects: [BCMSStatusObject],
  inputs: [BCMSStatusCreateDataInput, BCMSStatusUpdateDataInput],
  resolvers: [
    BCMSStatusCountResolver,
    BCMSStatusCreateResolver,
    BCMSStatusGetAllResolver,
    BCMSStatusGetByIdResolver,
    BCMSStatusUpdateResolver,
  ],
});
