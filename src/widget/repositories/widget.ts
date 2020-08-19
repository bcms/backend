import {
  MongoDBRepositoryPrototype,
  Logger,
  MongoDBRepository,
} from '@becomes/purple-cheetah';
import { Model } from 'mongoose';
import { Widget, IWidget } from '../models';

@MongoDBRepository({
  entity: {
    schema: Widget.schema,
  },
  name: `${process.env.DB_PRFX}_widgets`,
})
export class MongoWidgetRepository
  implements MongoDBRepositoryPrototype<Widget, IWidget> {
  repo: Model<IWidget>;
  logger: Logger;

  findAll: () => Promise<Widget[]>;
  findAllById: (ids: string[]) => Promise<Widget[]>;
  findAllBy: <Q>(query: Q) => Promise<Widget[]>;
  findById: (id: string) => Promise<Widget>;
  findBy: <Q>(query: Q) => Promise<Widget>;
  add: (e: Widget) => Promise<boolean>;
  update: (e: Widget) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;

  async findByName(name: string): Promise<Widget> {
    return await this.repo.findOne({ name });
  }

  async count(): Promise<number> {
    return await this.repo.countDocuments();
  }
}
