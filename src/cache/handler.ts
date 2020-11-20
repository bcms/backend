import {
  FSDBRepositoryPrototype,
  MongoDBRepositoryPrototype,
  FSDBEntity,
  IEntity,
  Entity,
  Queueable,
  QueueablePrototype,
} from '@becomes/purple-cheetah';
import { Types } from 'mongoose';

export abstract class CacheHandler<
  T extends FSDBEntity,
  K extends Entity,
  J extends IEntity,
  M extends FSDBRepositoryPrototype<T>,
  N extends MongoDBRepositoryPrototype<K, J>
> {
  protected cache: Array<T | K> = [];
  protected countLatch = false;
  protected queueable: QueueablePrototype<T | K | Array<T | K> | boolean>;

  constructor(protected repo: M | N, queueable: string[]) {
    this.queueable = Queueable(
      'findAll',
      'findAllById',
      'findById',
      'add',
      'update',
      'deleteById',
      ...queueable,
    );
  }

  protected async checkCountLatch() {
    if (this.countLatch === false) {
      this.countLatch = true;
      this.cache = await this.repo.findAll();
    }
  }

  async findAll(): Promise<Array<T | K>> {
    return (await this.queueable.exec(
      'findAll',
      'first_done_free_all',
      async () => {
        await this.checkCountLatch();
        return this.cache;
      },
    )) as Array<T | K>;
  }

  async findAllById(ids: string[]): Promise<Array<T | K>> {
    return (await this.queueable.exec(
      'findAllById',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) => ids.includes(`${e._id}`));
      },
    )) as Array<T | K>;
  }

  async findById(id: string): Promise<T | K> {
    const all = await this.findAll();
    return all.find(
      (e) =>
        id ===
        (e._id instanceof Types.ObjectId
          ? (e._id as Types.ObjectId).toHexString()
          : e._id));
    // return (await this.queueable.exec(
    //   'findById',
    //   'free_one_by_one',
    //   async () => {
    //     await this.checkCountLatch();
    //     return this.cache.find(
    //       (e) =>
    //         id ===
    //         (e._id instanceof Types.ObjectId
    //           ? (e._id as Types.ObjectId).toHexString()
    //           : e._id),
    //     );
    //   },
    // )) as T | K;
  }

  async add(entity: T | K): Promise<boolean> {
    return (await this.queueable.exec('add', 'free_one_by_one', async () => {
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
      const addResult = await this.repo.add(entity as T & K);
      if (addResult === false) {
        return false;
      }
      this.cache.push(entity);
      return true;
    })) as boolean;
  }

  async update(entity: T | K): Promise<boolean> {
    return (await this.queueable.exec('update', 'free_one_by_one', async () => {
      await this.checkCountLatch();
      const id =
        typeof entity._id === 'string' ? entity._id : entity._id.toHexString();
      for (const i in this.cache) {
        if (id === `${this.cache[i]._id}`) {
          const updateResult = await this.repo.update(entity as T & K);
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
    })) as boolean;
  }

  async deleteById(id: string): Promise<boolean> {
    return (await this.queueable.exec(
      'deleteById',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        for (let i = 0; i < this.cache.length; i = i + 1) {
          if (id === `${this.cache[i]._id}`) {
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
    )) as boolean;
  }
}
