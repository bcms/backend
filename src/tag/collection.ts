import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSTagCreateDataInput, BCMSTagUpdateDataInput } from './inputs';
import { BCMSTagObject } from './objects';
import {
  BCMSTagCreateResolver,
  BCMSTagGetAllResolver,
  BCMSTagGetByIdResolver,
  BCMSTagGetByValueResolver,
  BCMSTagGetManyResolver,
} from './resolvers';
import { BCMSTagUpdateResolver } from './resolvers/update';

export const BCMSTagCollection = createGraphqlCollection({
  name: 'tag',
  objects: [BCMSTagObject],
  inputs: [BCMSTagCreateDataInput, BCMSTagUpdateDataInput],
  resolvers: [
    BCMSTagCreateResolver,
    BCMSTagGetAllResolver,
    BCMSTagGetManyResolver,
    BCMSTagGetByIdResolver,
    BCMSTagGetByValueResolver,
    BCMSTagUpdateResolver,
  ],
});
