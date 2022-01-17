import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSMediaAggregateObject = createGraphqlObject({
  name: 'BCMSMediaAggregate',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    userId: 'String!',
    type: 'BCMSMediaType!',
    mimetype: 'String!',
    size: 'Float!',
    name: 'String!',
    path: 'String!',
    isInRoot: 'Boolean!',
    children: '[BCMSMediaAggregate!]',
    state: 'Boolean!',
  },
});

export const BCMSMediaSimpleAggregateObject = createGraphqlObject({
  name: 'BCMSMediaSimpleAggregate',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    userId: 'String!',
    type: 'BCMSMediaType!',
    mimetype: 'String!',
    size: 'Float!',
    name: 'String!',
    isInRoot: 'Boolean!',
    state: 'Boolean!',
  },
});
