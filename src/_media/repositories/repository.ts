import { FSMediaRepository } from './fs-media';
import { MongoMediaRepository } from './media';

export const MediaRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSMediaRepository()
    : new MongoMediaRepository();
