import type { Module } from '@becomes/purple-cheetah/types';
import { createBcmsApiKeyFactory } from './api';
import { createBcmsColorFactory } from './color';
import { createBcmsEntryFactory } from './entry';
import { createBcmsGroupFactory } from './group';
import { createBcmsIdCounterFactory } from './id-counter';
import { createBcmsLanguageFactory } from './language';
import { createBcmsMediaFactory } from './media';
import { createBcmsPropFactory } from './prop';
import { createBcmsStatusFactory } from './status';
import { createBcmsTagFactory } from './tag';
import { createBcmsTemplateFactory } from './template';
import { createBcmsTemplateOrganizerFactory } from './template-organizer';
import type { BCMSFactory as BCMSFactoryType } from './types';
import { createBcmsUserFactory } from './user';
import { createBcmsWidgetFactory } from './widget';

export const BCMSFactory: BCMSFactoryType = {
  apiKey: undefined as never,
  entry: undefined as never,
  group: undefined as never,
  idc: undefined as never,
  language: undefined as never,
  media: undefined as never,
  status: undefined as never,
  template: undefined as never,
  templateOrganizer: undefined as never,
  user: undefined as never,
  widget: undefined as never,
  prop: undefined as never,
  color: undefined as never,
  tag: undefined as never,
};

export function createBcmsFactories(): Module {
  return {
    name: 'Create factories',
    initialize({ next }) {
      BCMSFactory.apiKey = createBcmsApiKeyFactory();
      BCMSFactory.entry = createBcmsEntryFactory();
      BCMSFactory.group = createBcmsGroupFactory();
      BCMSFactory.idc = createBcmsIdCounterFactory();
      BCMSFactory.language = createBcmsLanguageFactory();
      BCMSFactory.media = createBcmsMediaFactory();
      BCMSFactory.status = createBcmsStatusFactory();
      BCMSFactory.template = createBcmsTemplateFactory();
      BCMSFactory.templateOrganizer = createBcmsTemplateOrganizerFactory();
      BCMSFactory.user = createBcmsUserFactory();
      BCMSFactory.widget = createBcmsWidgetFactory();
      BCMSFactory.prop = createBcmsPropFactory();
      BCMSFactory.color = createBcmsColorFactory();
      BCMSFactory.tag = createBcmsTagFactory();
      next();
    },
  };
}
