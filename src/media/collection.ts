import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import { BCMSMediaAggregateObject, BCMSMediaObject } from './objects';
import {
  BCMSMediaCountResolver,
  BCMSMediaGetAllAggregatedResolver,
  BCMSMediaGetAllByParentIdResolver,
  BCMSMediaGetAllResolver,
  BCMSMediaGetManyResolver,
} from './resolvers';

export const BCMSMediaCollection = createGraphqlCollection({
  name: 'media',
  enums: [BCMSMediaTypeEnum],
  objects: [BCMSMediaObject, BCMSMediaAggregateObject],
  resolvers: [
    BCMSMediaCountResolver,
    BCMSMediaGetAllAggregatedResolver,
    BCMSMediaGetAllByParentIdResolver,
    BCMSMediaGetAllResolver,
    BCMSMediaGetManyResolver,
  ],
});
