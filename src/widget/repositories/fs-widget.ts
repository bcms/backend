import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
  FSDBRepository,
} from '@becomes/purple-cheetah';
import { WidgetSchema, FSWidget } from '../models';

@FSDBRepository({
  collectionName: `${process.env.DB_PRFX}_widgets`,
  schema: WidgetSchema,
})
export class FSWidgetRepository implements FSDBRepositoryPrototype<FSWidget> {
  repo: Model<FSWidget>;
  logger: Logger;

  findAll: () => Promise<FSWidget[]>;
  findAllBy: (query: (e: FSWidget) => boolean) => Promise<FSWidget[]>;
  findAllById: (ids: string[]) => Promise<FSWidget[]>;
  findBy: (query: (e: FSWidget) => boolean) => Promise<FSWidget>;
  findById: (id: string) => Promise<FSWidget>;
  add: (e: FSWidget) => Promise<void>;
  addMany: (e: FSWidget[]) => Promise<void>;
  update: (e: FSWidget) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSWidget) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSWidget) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findByName(name: string): Promise<FSWidget> {
    return await this.repo.findOne((e) => e.name === name);
  }
}
