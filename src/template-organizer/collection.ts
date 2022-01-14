import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import {
  BCMSTemplateOrganizerCreateDataInput,
  BCMSTemplateOrganizerUpdateDataInput,
} from './inputs';
import { BCMSTemplateOrganizerObject } from './objects';
import {
  BCMSTemplateOrganizerCreateResolver,
  BCMSTemplateOrganizerGetAllResolver,
  BCMSTemplateOrganizerGetByIdResolver,
  BCMSTemplateOrganizerGetManyResolver,
  BCMSTemplateOrganizerUpdateResolver,
} from './resolvers';

export const BCMSTemplateOrganizerCollection = createGraphqlCollection({
  name: 'template_organizer',
  objects: [BCMSTemplateOrganizerObject],
  inputs: [
    BCMSTemplateOrganizerCreateDataInput,
    BCMSTemplateOrganizerUpdateDataInput,
  ],
  resolvers: [
    BCMSTemplateOrganizerCreateResolver,
    BCMSTemplateOrganizerGetAllResolver,
    BCMSTemplateOrganizerGetManyResolver,
    BCMSTemplateOrganizerGetByIdResolver,
    BCMSTemplateOrganizerUpdateResolver,
  ],
});
