import { createGraphqlUnion } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaAggregateUnion = createGraphqlUnion({
  name: 'BCMSMediaAggregateUnion',
  types: ['BCMSMediaAggregate', 'BCMSMediaSimpleAggregate'],
});
