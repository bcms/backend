import {
  FSDBRepository,
  FSDBRepositoryPrototype,
  Logger,
  Model,
} from '@becomes/purple-cheetah';
import { FSStatus, StatusSchema } from '../models';

@FSDBRepository({
  collectionName: `${process.env.DB_PRFX}_statuses`,
  schema: StatusSchema,
})
export class FSStatusRepository implements FSDBRepositoryPrototype<FSStatus> {
  repo: Model<FSStatus>;
  logger: Logger;
  findAll: () => Promise<FSStatus[]>;
  findAllBy: (query: (e: FSStatus) => boolean) => Promise<FSStatus[]>;
  findAllById: (ids: string[]) => Promise<FSStatus[]>;
  findBy: (query: (e: FSStatus) => boolean) => Promise<FSStatus>;
  findById: (id: string) => Promise<FSStatus>;
  add: (e: FSStatus) => Promise<void>;
  addMany: (e: FSStatus[]) => Promise<void>;
  update: (e: FSStatus) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSStatus) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSStatus) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findByName(name: string): Promise<FSStatus> {
    return await this.repo.findOne((e) => e.name === name);
  }
}
