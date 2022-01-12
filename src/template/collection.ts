import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSTemplateObject } from './objects';
import {
  BCMSTemplateGetAllResolver,
  BCMSTemplateManyResolver,
} from './resolvers';

export const BCMSTemplateCollection = createGraphqlCollection({
  name: 'template',
  objects: [BCMSTemplateObject],
  inputs: [],
  resolvers: [BCMSTemplateGetAllResolver, BCMSTemplateManyResolver],
});
