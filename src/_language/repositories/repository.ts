import { FSLanguageRepository } from './fs-language';
import { MongoLanguageRepository } from './language';

export const LanguageRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSLanguageRepository()
    : new MongoLanguageRepository();
