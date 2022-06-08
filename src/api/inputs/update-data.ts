import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSApiKeyUpdateDataInput = createGraphqlInput({
  name: 'BCMSApiKeyUpdateData',
  fields: {
    _id: 'String!',
    name: 'String',
    desc: 'String',
    blocked: 'Boolean',
    access: 'BCMSApiKeyAccessData',
  },
});
