import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import {
  BCMSTemplateCreateDataInput,
  BCMSTemplateUpdateDataInput,
} from './inputs';
import { BCMSTemplateObject } from './objects';
import {
  BCMSTemplateCountResolver,
  BCMSTemplateCreateResolver,
  BCMSTemplateDeleteResolver,
  BCMSTemplateGetAllResolver,
  BCMSTemplateGetByIdResolver,
  BCMSTemplateManyResolver,
  BCMSTemplateUpdateResolver,
} from './resolvers';

export const BCMSTemplateCollection = createGraphqlCollection({
  name: 'template',
  objects: [BCMSTemplateObject],
  inputs: [BCMSTemplateCreateDataInput, BCMSTemplateUpdateDataInput],
  resolvers: [
    BCMSTemplateCountResolver,
    BCMSTemplateCreateResolver,
    BCMSTemplateDeleteResolver,
    BCMSTemplateGetAllResolver,
    BCMSTemplateManyResolver,
    BCMSTemplateGetByIdResolver,
    BCMSTemplateUpdateResolver,
  ],
});
