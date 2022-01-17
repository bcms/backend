import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import { BCMSMediaCreateDirDataInput } from './inputs';
import {
  BCMSMediaAggregateObject,
  BCMSMediaObject,
  BCMSMediaSimpleAggregateObject,
} from './objects';
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
import { BCMSMediaAggregateUnion } from './unions';

export const BCMSMediaCollection = createGraphqlCollection({
  name: 'media',
  enums: [BCMSMediaTypeEnum],
  unions: [BCMSMediaAggregateUnion],
  inputs: [BCMSMediaCreateDirDataInput],
  objects: [
    BCMSMediaObject,
    BCMSMediaAggregateObject,
    BCMSMediaSimpleAggregateObject,
  ],
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
