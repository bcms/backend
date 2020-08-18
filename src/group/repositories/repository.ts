import { FSGroupRepository } from './fs-group';
import { MongoGroupRepository } from './group';

let repo: FSGroupRepository | MongoGroupRepository;
if (process.env.DB_USE_FS) {
  repo = new FSGroupRepository();
} else {
  repo = new MongoGroupRepository();
}

export const GroupRepo = repo;
