import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSColorSourceTypeEnum } from './enums';
import {
  BCMSColorCreateDataInput,
  BCMSColorSourceInput,
  BCMSColorUpdateDataInput,
} from './inputs';
import { BCMSColorObject, BCMSColorSourceObject } from './objects';
import {
  BCMSColorCountResolver,
  BCMSColorCreateResolver,
  BCMSColorDeleteResolver,
  BCMSColorGetAllResolver,
  BCMSColorGetByIdResolver,
  BCMSColorGetManyResolver,
  BCMSColorUpdateResolver,
} from './resolvers';

export const BCMSColorCollection = createGraphqlCollection({
  name: 'color',
  objects: [BCMSColorObject, BCMSColorSourceObject],
  enums: [BCMSColorSourceTypeEnum],
  inputs: [
    BCMSColorCreateDataInput,
    BCMSColorSourceInput,
    BCMSColorUpdateDataInput,
  ],
  resolvers: [
    BCMSColorCreateResolver,
    BCMSColorGetAllResolver,
    BCMSColorGetManyResolver,
    BCMSColorCountResolver,
    BCMSColorGetByIdResolver,
    BCMSColorDeleteResolver,
    BCMSColorUpdateResolver,
  ],
});
