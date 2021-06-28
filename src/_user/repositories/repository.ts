import { FSUserRepository } from './fs-user';
import { MongoUserRepository } from './user';

export const UserRepo =
  process.env.DB_USE_FS === 'true'
    ? new FSUserRepository()
    : new MongoUserRepository();
