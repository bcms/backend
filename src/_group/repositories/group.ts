import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { Group, IGroup } from '../models';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: Group.schema,
  },
  name: `${process.env.DB_PRFX}_groups`,
})
export class MongoGroupRepository
  implements MongoDBRepositoryPrototype<Group, IGroup> {
  repo: Model<IGroup>;
  logger: Logger;

  findAll: () => Promise<Group[]>;
  findAllById: (ids: string[]) => Promise<Group[]>;
  findAllBy: <Q>(query: Q) => Promise<Group[]>;
  findById: (id: string) => Promise<Group>;
  findBy: <Q>(query: Q) => Promise<Group>;
  add: (e: Group) => Promise<boolean>;
  update: (e: Group) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByName(name: string): Promise<Group> {
    return await this.repo.findOne({ name });
  }

  async count(): Promise<number> {
    return await this.repo.countDocuments();
  }
}
