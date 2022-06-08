import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSTagCreateDataInput, BCMSTagUpdateDataInput } from './inputs';
import { BCMSTagObject } from './objects';
import {
  BCMSTagCreateResolver,
  BCMSTagDeleteResolver,
  BCMSTagGetAllResolver,
  BCMSTagGetByIdResolver,
  BCMSTagGetByValueResolver,
  BCMSTagGetManyResolver,
  BCMSTagUpdateResolver,
} from './resolvers';

export const BCMSTagCollection = createGraphqlCollection({
  name: 'tag',
  objects: [BCMSTagObject],
  inputs: [BCMSTagCreateDataInput, BCMSTagUpdateDataInput],
  resolvers: [
    BCMSTagCreateResolver,
    BCMSTagDeleteResolver,
    BCMSTagGetAllResolver,
    BCMSTagGetManyResolver,
    BCMSTagGetByIdResolver,
    BCMSTagGetByValueResolver,
    BCMSTagUpdateResolver,
  ],
});
