import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSMediaTypeEnum } from './enums';
import { BCMSMediaObject } from './objects';
import { BCMSMediaGetAllResolver } from './resolvers';

export const BCMSMediaCollection = createGraphqlCollection({
  name: 'media',
  enums: [BCMSMediaTypeEnum],
  objects: [BCMSMediaObject],
  resolvers: [BCMSMediaGetAllResolver],
});
