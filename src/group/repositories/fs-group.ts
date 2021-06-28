import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
  FSDBRepository,
} from '@becomes/purple-cheetah';
import { FSGroup, GroupSchema } from '../models';

@FSDBRepository({
  collectionName: `${process.env.DB_PRFX}_groups`,
  schema: GroupSchema,
})
export class FSGroupRepository implements FSDBRepositoryPrototype<FSGroup> {
  repo: Model<FSGroup>;
  logger: Logger;

  findAll: () => Promise<FSGroup[]>;
  findAllBy: (query: (e: FSGroup) => boolean) => Promise<FSGroup[]>;
  findAllById: (ids: string[]) => Promise<FSGroup[]>;
  findBy: (query: (e: FSGroup) => boolean) => Promise<FSGroup>;
  findById: (id: string) => Promise<FSGroup>;
  add: (e: FSGroup) => Promise<void>;
  addMany: (e: FSGroup[]) => Promise<void>;
  update: (e: FSGroup) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSGroup) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSGroup) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findByName(name: string): Promise<FSGroup> {
    return await this.repo.findOne((e) => e.name === name);
  }
}
