import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSPropTypeEnum } from './enums';
import { BCMSPropObject, BCMSPropDataValueStringObject } from './objects';
import { BCMSPropDataUnion } from './unions';

export const BCMSPropCollection = createGraphqlCollection({
  name: 'prop',
  enums: [BCMSPropTypeEnum],
  unions: [BCMSPropDataUnion],
  objects: [BCMSPropDataValueStringObject, BCMSPropObject],
});
