import type {
  BCMSApiKeyFactory,
  BCMSEntryFactory,
  BCMSGroupFactory,
  BCMSIdCounterFactory,
  BCMSLanguageFactory,
  BCMSMediaFactory,
  BCMSPropFactory,
  BCMSStatusFactory,
  BCMSTemplateFactory,
  BCMSTemplateOrganizerFactory,
  BCMSUserFactory,
  BCMSWidgetFactory,
  BCMSColorFactory,
} from '.';

export interface BCMSFactory {
  apiKey: BCMSApiKeyFactory;
  entry: BCMSEntryFactory;
  group: BCMSGroupFactory;
  idc: BCMSIdCounterFactory;
  language: BCMSLanguageFactory;
  media: BCMSMediaFactory;
  status: BCMSStatusFactory;
  template: BCMSTemplateFactory;
  templateOrganizer: BCMSTemplateOrganizerFactory;
  user: BCMSUserFactory;
  widget: BCMSWidgetFactory;
  prop: BCMSPropFactory;
  color: BCMSColorFactory;
}
