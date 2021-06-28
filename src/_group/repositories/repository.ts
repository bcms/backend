import { FSGroupRepository } from './fs-group';
import { MongoGroupRepository } from './group';

export const GroupRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSGroupRepository()
    : new MongoGroupRepository();
