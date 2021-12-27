import { createGraphqlUnion } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSPropDataUnion = createGraphqlUnion({
  name: 'BCMSPropData',
  types: ['BCMSPropDataValueString'],
});
