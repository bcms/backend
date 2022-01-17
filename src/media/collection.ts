import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import { BCMSMediaAggregateObject, BCMSMediaObject } from './objects';
import {
  BCMSMediaGetAllAggregatedResolver,
  BCMSMediaGetAllResolver,
} from './resolvers';

export const BCMSMediaCollection = createGraphqlCollection({
  name: 'media',
  enums: [BCMSMediaTypeEnum],
  objects: [BCMSMediaObject, BCMSMediaAggregateObject],
  resolvers: [BCMSMediaGetAllResolver, BCMSMediaGetAllAggregatedResolver],
});
