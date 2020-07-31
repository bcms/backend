import { FSUserRepository } from './fs-user';
import { MongoUserRepository } from './user';

let repo: FSUserRepository | MongoUserRepository;
if (process.env.DB_USE_FS) {
  repo = new FSUserRepository();
} else {
  repo = new MongoUserRepository();
}

export const UserRepo = repo;
