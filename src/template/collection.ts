import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSTemplateObject } from './objects';
import {
  BCMSTemplateCountResolver,
  BCMSTemplateGetAllResolver,
  BCMSTemplateManyResolver,
} from './resolvers';

export const BCMSTemplateCollection = createGraphqlCollection({
  name: 'template',
  objects: [BCMSTemplateObject],
  inputs: [],
  resolvers: [
    BCMSTemplateCountResolver,
    BCMSTemplateGetAllResolver,
    BCMSTemplateManyResolver,
  ],
});
