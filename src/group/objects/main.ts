import { BCMSGqlDefaultEntityProps } from '@bcms/types';
import { createGraphqlObject } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSGroupObject = createGraphqlObject({
  name: 'BCMSGroup',
  fields: {
    ...BCMSGqlDefaultEntityProps,
    cid: 'String!',
    name: 'String!',
    label: 'String!',
    desc: 'String!',
    props: '[BCMSProp!]!',
  },
});
