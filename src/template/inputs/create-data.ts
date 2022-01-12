import { createGraphqlInput } from '@becomes/purple-cheetah-mod-graphql';

export const BCMSTemplateCreateDataInput = createGraphqlInput({
  name: 'BCMSTemplateCreateData',
  fields: {
    label: 'String!',
    desc: 'String',
    singleEntry: 'Boolean!',
  },
});
