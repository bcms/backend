import type {
  BCMSApiKeyRepository,
  BCMSEntryRepository,
  BCMSGroupRepository,
  BCMSIdCounterRepository,
  BCMSLanguageRepository,
  BCMSMediaRepository,
  BCMSStatusRepository,
  BCMSTemplateOrganizerRepository,
  BCMSTemplateRepository,
  BCMSUserRepository,
  BCMSWidgetRepository,
  BCMSColorRepository,
  BCMSTagRepository,
} from '.';
import type { BCMSChangeRepository } from './changes';

export interface BCMSRepo {
  apiKey: BCMSApiKeyRepository;
  entry: BCMSEntryRepository;
  group: BCMSGroupRepository;
  idc: BCMSIdCounterRepository;
  language: BCMSLanguageRepository;
  media: BCMSMediaRepository;
  status: BCMSStatusRepository;
  template: BCMSTemplateRepository;
  templateOrganizer: BCMSTemplateOrganizerRepository;
  user: BCMSUserRepository;
  widget: BCMSWidgetRepository;
  color: BCMSColorRepository;
  tag: BCMSTagRepository;
  change: BCMSChangeRepository;
}
