import { FSTemplateRepository } from './fs-template';
import { MongoTemplateRepository } from './template';

let repo: FSTemplateRepository | MongoTemplateRepository;
if (process.env.DB_USE_FS) {
  repo = new FSTemplateRepository();
} else {
  repo = new MongoTemplateRepository();
}

export const TemplateRepo = repo;
