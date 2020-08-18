import {
  FSDBRepositoryPrototype,
  MongoDBRepositoryPrototype,
  FSDBEntity,
  IEntity,
  Entity,
  Queueable,
  QueueableItem,
} from '@becomes/purple-cheetah';
import { Types } from 'mongoose';

export abstract class CacheHandler<
  T extends FSDBEntity,
  K extends Entity,
  J extends IEntity
> extends Queueable {
  protected cache: Array<T | K> = [];
  protected countLatch: boolean = false;

  constructor(
    protected repo:
      | FSDBRepositoryPrototype<T>
      | MongoDBRepositoryPrototype<K, J>,
    queue: {
      [key: string]: {
        list: QueueableItem[];
        open: boolean;
      };
    },
  ) {
    super({
      findAll: {
        open: false,
        list: [],
      },
      findAllById: {
        open: false,
        list: [],
      },
      findById: {
        open: false,
        list: [],
      },
      add: {
        open: false,
        list: [],
      },
      update: {
        open: false,
        list: [],
      },
      deleteById: {
        open: false,
        list: [],
      },
      ...queue,
    });
  }

  protected async checkCountLatch() {
    if (!this.countLatch) {
      this.countLatch = true;
      this.cache = await this.repo.findAll();
    }
  }

  async findAll(): Promise<Array<T | K>> {
    return await this.queueable<Array<T | K>>(
      'findAll',
      'first_done_free_all',
      async () => {
        await this.checkCountLatch();
        return this.cache;
      },
    );
  }

  async findAllById(ids: string): Promise<T[] | K[]> {
    return await this.queueable<Array<T | K>>(
      'findAllById',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) =>
          ids.includes(
            e._id instanceof Types.ObjectId
              ? (e._id as any).toHexString()
              : e._id,
          ),
        );
      },
    );
  }

  async findById(id: string): Promise<T | K> {
    return await this.queueable<T | K>(
      'findById',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find(
          (e) =>
            id ===
            (e._id instanceof Types.ObjectId
              ? (e._id as Types.ObjectId).toHexString()
              : e._id),
        );
      },
    );
  }

  async add(entity: T | K): Promise<boolean> {
    return await this.queueable<boolean>('add', 'free_one_by_one', async () => {
      await this.checkCountLatch();
      const id =
        typeof entity._id === 'string' ? entity._id : entity._id.toHexString();
      if (
        this.cache.find(
          (e) =>
            id === (typeof e._id === 'string' ? e._id : e._id.toHexString()),
        )
      ) {
        // tslint:disable-next-line: no-console
        console.error(`Cache Entity with ID "${id}" already exist.`);
        return false;
      }
      const addResult = await this.repo.add(entity as any);
      if (addResult === false) {
        return false;
      }
      this.cache.push(entity);
      return true;
    });
  }

  async update(entity: T | K): Promise<boolean> {
    return await this.queueable<boolean>(
      'update',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        const id =
          typeof entity._id === 'string'
            ? entity._id
            : entity._id.toHexString();
        for (const i in this.cache) {
          if (
            id ===
            (typeof this.cache[i]._id === 'string'
              ? this.cache[i]._id
              : (this.cache[i]._id as any).toHexString())
          ) {
            const updateResult = await this.repo.update(entity as any);
            if (updateResult === false) {
              return false;
            }
            this.cache[i] = entity;
            return true;
          }
        }
        // tslint:disable-next-line: no-console
        console.error(`Cache Entity with ID "${id}" does not exist.`);
        return false;
      },
    );
  }

  async deleteById(id: string): Promise<boolean> {
    return await this.queueable<boolean>(
      'deleteById',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        for (let i = 0; i < this.cache.length; i = i + 1) {
          if (
            id ===
            (typeof this.cache[i]._id === 'string'
              ? this.cache[i]._id
              : (this.cache[i]._id as any).toHexString())
          ) {
            const deleteResult = await this.repo.deleteById(id);
            if (deleteResult === false) {
              return false;
            }
            this.cache.splice(i, 1);
            return true;
          }
        }
        // tslint:disable-next-line: no-console
        console.error(`Cache Entity with ID "${id}" does not exist.`);
        return false;
      },
    );
  }
}
