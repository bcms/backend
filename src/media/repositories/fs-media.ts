import {
  FSDBRepositoryPrototype,
  Model,
  Logger,
} from '@becomes/purple-cheetah';
import { FSMedia } from '../models';

export class FSMediaRepository implements FSDBRepositoryPrototype<FSMedia> {
  repo: Model<FSMedia>;
  logger: Logger;

  findAll: () => Promise<FSMedia[]>;
  findAllBy: (query: (e: FSMedia) => boolean) => Promise<FSMedia[]>;
  findAllById: (ids: string[]) => Promise<FSMedia[]>;
  findBy: (query: (e: FSMedia) => boolean) => Promise<FSMedia>;
  findById: (id: string) => Promise<FSMedia>;
  add: (e: FSMedia) => Promise<void>;
  addMany: (e: FSMedia[]) => Promise<void>;
  update: (e: FSMedia) => Promise<boolean>;
  deleteById: (id: string) => Promise<boolean>;
  deleteAllById: (ids: string[]) => Promise<number | boolean>;
  deleteOne: (query: (e: FSMedia) => boolean) => Promise<void>;
  deleteMany: (query: (e: FSMedia) => boolean) => Promise<void>;
  count: () => Promise<number>;

  async findAllByIsInRoot(isInRoot: boolean): Promise<FSMedia[]> {
    return await this.repo.find((e) => e.isInRoot === isInRoot);
  }

  async findAllByPath(path: string): Promise<FSMedia[]> {
    return await this.repo.find((e) => e.path === path);
  }

  async findByPath(path: string): Promise<FSMedia | null> {
    return await this.repo.findOne((e) => e.path === path);
  }

  async findByNameAndPath(name: string, path: string): Promise<FSMedia | null> {
    return await this.repo.findOne((e) => e.name === name && e.path === path);
  }
}
