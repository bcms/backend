import {
  MongoDBRepositoryPrototype,
  IEntity,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { Entry, IEntry } from '../models';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: Entry.schema,
  },
  name: `${process.env.DB_PRFX}_entries`,
})
export class MongoEntryRepository
  implements MongoDBRepositoryPrototype<Entry, IEntry> {
  repo: Model<IEntry>;
  logger: Logger;

  findAll: () => Promise<Entry[]>;
  findAllById: (ids: string[]) => Promise<Entry[]>;
  findAllBy: <Q>(query: Q) => Promise<Entry[]>;
  findById: (id: string) => Promise<Entry>;
  findBy: <Q>(query: Q) => Promise<Entry>;
  add: (e: Entry) => Promise<boolean>;
  update: (e: Entry) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  async count(): Promise<number> {
    return await this.repo.countDocuments();
  }

  async findAllByTemplateId(templateId): Promise<Entry[]> {
    return await this.repo.find({ templateId });
  }

}
