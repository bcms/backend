import { createGraphqlCollection } from '@becomes/purple-cheetah-mod-graphql';
import {
  BCMSTemplateOrganizerCreateDataInput,
  BCMSTemplateOrganizerUpdateDataInput,
} from './inputs';
import { BCMSTemplateOrganizerObject } from './objects';
import {
  BCMSTemplateOrganizerCreateResolver,
  BCMSTemplateOrganizerDeleteResolver,
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
    BCMSTemplateOrganizerDeleteResolver,
    BCMSTemplateOrganizerGetAllResolver,
    BCMSTemplateOrganizerGetManyResolver,
    BCMSTemplateOrganizerGetByIdResolver,
    BCMSTemplateOrganizerUpdateResolver,
  ],
});
