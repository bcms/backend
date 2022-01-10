import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSColorSourceTypeEnum } from './enums';
import { BCMSColorCreateDataInput, BCMSColorSourceInput } from './inputs';
import { BCMSColorObject, BCMSColorSourceObject } from './objects';
import {
  BCMSColorCountResolver,
  BCMSColorCreateResolver,
  BCMSColorDeleteResolver,
  BCMSColorGetAllResolver,
  BCMSColorGetByIdResolver,
  BCMSColorGetManyResolver,
} from './resolvers';

export const BCMSColorCollection = createGraphqlCollection({
  name: 'color',
  objects: [BCMSColorObject, BCMSColorSourceObject],
  enums: [BCMSColorSourceTypeEnum],
  inputs: [BCMSColorCreateDataInput, BCMSColorSourceInput],
  resolvers: [
    BCMSColorCreateResolver,
    BCMSColorGetAllResolver,
    BCMSColorGetManyResolver,
    BCMSColorCountResolver,
    BCMSColorGetByIdResolver,
    BCMSColorDeleteResolver,
  ],
});
