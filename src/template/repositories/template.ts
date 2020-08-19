import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { Template, ITemplate } from '../models';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: Template.schema,
  },
  name: `${process.env.DB_PRFX}_templates`,
})
export class MongoTemplateRepository
  implements MongoDBRepositoryPrototype<Template, ITemplate> {
  repo: Model<ITemplate>;
  logger: Logger;

  findAll: () => Promise<Template[]>;
  findAllById: (ids: string[]) => Promise<Template[]>;
  findAllBy: <Q>(query: Q) => Promise<Template[]>;
  findById: (id: string) => Promise<Template>;
  findBy: <Q>(query: Q) => Promise<Template>;
  add: (e: Template) => Promise<boolean>;
  update: (e: Template) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByName(name: string): Promise<Template> {
    return await this.repo.findOne({ name });
  }
}
