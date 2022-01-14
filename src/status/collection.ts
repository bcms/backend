import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSStatusCreateDataInput } from './inputs';
import { BCMSStatusObject } from './objects';
import {
  BCMSStatusCountResolver,
  BCMSStatusCreateResolver,
  BCMSStatusGetAllResolver,
  BCMSStatusGetByIdResolver,
} from './resolvers';

export const BCMSStatusCollection = createGraphqlCollection({
  name: 'status',
  objects: [BCMSStatusObject],
  inputs: [BCMSStatusCreateDataInput],
  resolvers: [
    BCMSStatusCountResolver,
    BCMSStatusCreateResolver,
    BCMSStatusGetAllResolver,
    BCMSStatusGetByIdResolver,
  ],
});
