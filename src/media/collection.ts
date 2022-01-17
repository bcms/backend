import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import {
  BCMSMediaAggregateObject,
  BCMSMediaObject,
  BCMSMediaSimpleAggregateObject,
} from './objects';
import {
  BCMSMediaCountResolver,
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
  objects: [
    BCMSMediaObject,
    BCMSMediaAggregateObject,
    BCMSMediaSimpleAggregateObject,
  ],
  resolvers: [
    BCMSMediaCountResolver,
    BCMSMediaGetAllAggregatedResolver,
    BCMSMediaGetAllByParentIdResolver,
    BCMSMediaGetAllResolver,
    BCMSMediaGetManyResolver,
    BCMSMediaGetByIdAggregatedResolver,
    BCMSMediaGetByIdResolver,
  ],
});
