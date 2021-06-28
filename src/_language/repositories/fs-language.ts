import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
  FSDBRepository,
} from '@becomes/purple-cheetah';
import { FSLanguage, LanguageSchema } from '../models';

@FSDBRepository({
  schema: LanguageSchema,
  collectionName: `${process.env.DB_PRFX}_languages`,
})
export class FSLanguageRepository
  implements FSDBRepositoryPrototype<FSLanguage> {
  repo: Model<FSLanguage>;
  logger: Logger;

  findAll: () => Promise<FSLanguage[]>;
  findAllBy: (query: (e: FSLanguage) => boolean) => Promise<FSLanguage[]>;
  findAllById: (ids: string[]) => Promise<FSLanguage[]>;
  findBy: (query: (e: FSLanguage) => boolean) => Promise<FSLanguage>;
  findById: (id: string) => Promise<FSLanguage>;
  add: (e: FSLanguage) => Promise<void>;
  addMany: (e: FSLanguage[]) => Promise<void>;
  update: (e: FSLanguage) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSLanguage) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSLanguage) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findByCode(code: string): Promise<FSLanguage> {
    return this.repo.findOne((e) => e.code === code);
  }

  async findDefault(): Promise<FSLanguage> {
    return this.repo.findOne((e) => e.def === true);
  }
}
