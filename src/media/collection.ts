import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import { BCMSMediaCreateDirDataInput } from './inputs';
import { BCMSMediaAggregateObject, BCMSMediaObject } from './objects';
import {
  BCMSMediaCountResolver,
  BCMSMediaCreateDirResolver,
  BCMSMediaGetAllAggregatedResolver,
  BCMSMediaGetAllByParentIdResolver,
  BCMSMediaGetAllResolver,
  BCMSMediaGetByIdAggregatedResolver,
  BCMSMediaGetByIdResolver,
  BCMSMediaGetManyResolver,
} from './resolvers';

export const BCMSMediaCollection = createGraphqlCollection({
  name: 'media',
  enums: [BCMSMediaTypeEnum],
  inputs: [BCMSMediaCreateDirDataInput],
  objects: [BCMSMediaObject, BCMSMediaAggregateObject],
  resolvers: [
    BCMSMediaCountResolver,
    BCMSMediaCreateDirResolver,
    BCMSMediaGetAllAggregatedResolver,
    BCMSMediaGetAllByParentIdResolver,
    BCMSMediaGetAllResolver,
    BCMSMediaGetManyResolver,
    BCMSMediaGetByIdAggregatedResolver,
    BCMSMediaGetByIdResolver,
  ],
});
