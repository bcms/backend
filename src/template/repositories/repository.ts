import { FSTemplateRepository } from './fs-template';
import { MongoTemplateRepository } from './template';

export const TemplateRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSTemplateRepository()
    : new MongoTemplateRepository();
