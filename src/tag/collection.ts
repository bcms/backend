import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSTagCreateDataInput } from './inputs';
import { BCMSTagObject } from './objects';
import {
  BCMSTagCreateResolver,
  BCMSTagGetAllResolver,
  BCMSTagGetManyResolver,
} from './resolvers';

export const BCMSTagCollection = createGraphqlCollection({
  name: 'tag',
  objects: [BCMSTagObject],
  inputs: [BCMSTagCreateDataInput],
  resolvers: [
    BCMSTagCreateResolver,
    BCMSTagGetAllResolver,
    BCMSTagGetManyResolver,
  ],
});
