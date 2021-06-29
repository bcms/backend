import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
  FSDBRepository,
} from '@becomes/purple-cheetah';
import { FSTemplate, TemplateSchema } from '../models';

@FSDBRepository({
  schema: TemplateSchema,
  collectionName: `${process.env.DB_PRFX}_templates`,
})
export class FSTemplateRepository
  implements FSDBRepositoryPrototype<FSTemplate> {
  repo: Model<FSTemplate>;
  logger: Logger;

  findAll: () => Promise<FSTemplate[]>;
  findAllBy: (query: (e: FSTemplate) => boolean) => Promise<FSTemplate[]>;
  findAllById: (ids: string[]) => Promise<FSTemplate[]>;
  findBy: (query: (e: FSTemplate) => boolean) => Promise<FSTemplate>;
  findById: (id: string) => Promise<FSTemplate>;
  add: (e: FSTemplate) => Promise<void>;
  addMany: (e: FSTemplate[]) => Promise<void>;
  update: (e: FSTemplate) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSTemplate) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSTemplate) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findByName(name: string): Promise<FSTemplate> {
    return await this.repo.findOne((e) => e.name === name);
  }
}
