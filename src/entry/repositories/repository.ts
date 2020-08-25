import { FSEntryRepository } from './fs-entry';
import { MongoEntryRepository } from './entry';

export const EntryRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSEntryRepository()
    : new MongoEntryRepository();
