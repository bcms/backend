import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { Language, ILanguage } from '../models';
import { Model } from 'mongoose';

@MongoDBRepository({
  entity: {
    schema: Language.schema,
  },
  name: `${process.env.DB_PRFX}_languages`,
})
export class MongoLanguageRepository
  implements MongoDBRepositoryPrototype<Language, ILanguage> {
  repo: Model<ILanguage>;
  logger: Logger;

  findAll: () => Promise<Language[]>;
  findAllById: (ids: string[]) => Promise<Language[]>;
  findAllBy: <Q>(query: Q) => Promise<Language[]>;
  findById: (id: string) => Promise<Language>;
  findBy: <Q>(query: Q) => Promise<Language>;
  add: (e: Language) => Promise<boolean>;
  update: (e: Language) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByCode(code: string): Promise<Language> {
    return await this.repo.findOne({ code });
  }

  async findDefault(): Promise<Language> {
    return await this.repo.findOne({ def: true });
  }

  async count(): Promise<number> {
    return await this.repo.countDocuments();
  }
}
