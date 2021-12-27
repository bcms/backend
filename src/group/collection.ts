import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSGroupCreateDataInput } from './inputs';
import { BCMSGroupObject } from './objects';
import { BCMSGroupGetAllResolver } from './resolvers';

export const BCMSGroupCollection = createGraphqlCollection({
  name: 'group',
  objects: [BCMSGroupObject],
  inputs: [BCMSGroupCreateDataInput],
  resolvers: [BCMSGroupGetAllResolver],
});
