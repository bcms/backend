import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSLanguageCreateDataInput } from './inputs';
import { BCMSLanguageObject } from './objects';
import {
  BCMSLanguageCreateResolver,
  BCMSLanguageGetAllResolver,
} from './resolvers';

export const BCMSLanguageCollection = createGraphqlCollection({
  name: 'language',
  inputs: [BCMSLanguageCreateDataInput],
  objects: [BCMSLanguageObject],
  resolvers: [BCMSLanguageCreateResolver, BCMSLanguageGetAllResolver],
});
