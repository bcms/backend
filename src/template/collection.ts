import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import {
  BCMSTemplateCreateDataInput,
  BCMSTemplateUpdateDataInput,
} from './inputs';
import { BCMSTemplateObject } from './objects';
import {
  BCMSTemplateCountResolver,
  BCMSTemplateCreateResolver,
  BCMSTemplateGetAllResolver,
  BCMSTemplateGetByIdResolver,
  BCMSTemplateManyResolver,
} from './resolvers';
import { BCMSTemplateUpdateResolver } from './resolvers/update';

export const BCMSTemplateCollection = createGraphqlCollection({
  name: 'template',
  objects: [BCMSTemplateObject],
  inputs: [BCMSTemplateCreateDataInput, BCMSTemplateUpdateDataInput],
  resolvers: [
    BCMSTemplateCountResolver,
    BCMSTemplateCreateResolver,
    BCMSTemplateGetAllResolver,
    BCMSTemplateManyResolver,
    BCMSTemplateGetByIdResolver,
    BCMSTemplateUpdateResolver,
  ],
});
