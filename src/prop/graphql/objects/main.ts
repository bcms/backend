import { createGraphqlObject } from "@becomes/purple-cheetah-mod-graphql";

export const BCMSPropObject = createGraphqlObject({
  name: 'BCMSProp',
  fields: {
    id: 'String!',
    type: 'BCMSPropType!',
    required: 'Boolean!',
    name: 'String!',
    label: 'String!',
    array: 'Boolean!',
    defaultData: 'BCMSPropData!'
  }
})