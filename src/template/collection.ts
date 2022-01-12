import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import { BCMSTemplateCreateDataInput } from './inputs';
import { BCMSTemplateObject } from './objects';
import {
  BCMSTemplateCountResolver,
  BCMSTemplateCreateResolver,
  BCMSTemplateGetAllResolver,
  BCMSTemplateGetByIdResolver,
  BCMSTemplateManyResolver,
} from './resolvers';

export const BCMSTemplateCollection = createGraphqlCollection({
  name: 'template',
  objects: [BCMSTemplateObject],
  inputs: [BCMSTemplateCreateDataInput],
  resolvers: [
    BCMSTemplateCountResolver,
    BCMSTemplateCreateResolver,
    BCMSTemplateGetAllResolver,
    BCMSTemplateManyResolver,
    BCMSTemplateGetByIdResolver,
  ],
});
