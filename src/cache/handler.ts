import {
  FSDBRepositoryPrototype,
  MongoDBRepositoryPrototype,
  FSDBEntity,
  IEntity,
  Entity,
  Queueable,
  QueueablePrototype,
  Logger,
} from '@becomes/purple-cheetah';
import { Types } from 'mongoose';
import { CacheWriteBuffer } from './write-buffer';

export abstract class CacheHandler<T extends FSDBEntity,
  K extends Entity,
  J extends IEntity,
  M extends FSDBRepositoryPrototype<T>,
  N extends MongoDBRepositoryPrototype<K, J>> {
  protected cache: Array<T | K> = [];
  protected countLatch = false;
  protected queueable: QueueablePrototype<T | K | Array<T | K> | boolean>;

  protected constructor(
    protected repo: M | N,
    queueable: string[],
    protected logger: Logger,
  ) {
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
    await this.checkCountLatch();
    return this.cache;
  }

  async findAllById(ids: string[]): Promise<Array<T | K>> {
    await this.checkCountLatch();
    return this.cache.filter((e) => ids.includes(`${e._id}`));
  }

  async findById(id: string): Promise<T | K> {
    const all = await this.findAll();
    return all.find(
      (e) =>
        id ===
        (
          e._id instanceof Types.ObjectId
            ? (
              e._id as Types.ObjectId
            ).toHexString()
            : e._id
        ),
    );
  }

  async add(
    entity: T | K,
    onError?: () => Promise<void>,
    onSuccess?: () => Promise<void>,
  ): Promise<boolean> {
    if (!entity) {
      throw Error('Entity if undefined.');
    }
    await this.checkCountLatch();
    const id = `${entity._id}`;
    if (this.cache.find((e) => id === `${e._id}`)) {
      console.error(`Cache Entity with ID "${id}" already exist.`);
      return false;
    }
    this.cache.push(entity);
    CacheWriteBuffer.push({
      eid: id,
      type: 'add',
      entity: JSON.stringify(entity),
      repo: this.repo as
        | FSDBRepositoryPrototype<FSDBEntity>
        | MongoDBRepositoryPrototype<Entity, IEntity>,
      onError: async () => {
        this.logger.error(
          'add',
          'Failed to add entity to the database.',
        );
        for (let i = 0; i < this.cache.length; i++) {
          if (`${this.cache[i]._id}` === id) {
            this.cache.splice(
              i,
              1,
            );
            break;
          }
        }
        if (onError) {
          await onError();
        }
      },
      async onSuccess(): Promise<void> {
        if (onSuccess) {
          await onSuccess();
        }
      },
    });
    return true;
    // const addResult = await this.repo.add(entity as T & K);
    // if (addResult === false) {
    //   return false;
    // }
    // this.cache.push(entity);
    // return true;
  }

  async update(
    entity: T | K,
    onError?: (type: 'update' | 'add') => Promise<void>,
    onSuccess?: () => Promise<void>,
  ): Promise<boolean> {
    if (!entity) {
      throw Error('Entity if undefined.');
    }
    await this.checkCountLatch();
    const id = `${entity._id}`;
    for (const i in this.cache) {
      if (id === `${this.cache[i]._id}`) {
        // const updateResult = await this.repo.update(entity as T & K);
        // if (updateResult === false) {
        //   return false;
        // }
        this.cache[i] = entity;
        CacheWriteBuffer.push({
          eid: id,
          type: 'update',
          repo: this.repo as
            | FSDBRepositoryPrototype<FSDBEntity>
            | MongoDBRepositoryPrototype<Entity, IEntity>,
          entity: JSON.stringify(entity),
          onError: async (error, type, dbEntity) => {
            let found = false;
            for (const j in this.cache) {
              if (id === `${this.cache[j]._id}`) {
                this.cache[j] = dbEntity as T | K;
                found = true;
                break;
              }
            }
            if (!found) {
              this.cache.push(dbEntity as T | K);
            }
            if (onError) {
              await onError(found ? 'update' : 'add');
            }
          },
          async onSuccess(): Promise<void> {
            if (onSuccess) {
              await onSuccess();
            }
          },
        });
        return true;
      }
    }
    console.error(`Cache Entity with ID "${id}" does not exist.`);
    return false;
  }

  async deleteById(
    id: string,
    onError?: () => Promise<void>,
    onSuccess?: () => Promise<void>,
  ): Promise<boolean> {
    await this.checkCountLatch();
    for (let i = 0; i < this.cache.length; i = i + 1) {
      if (id === `${this.cache[i]._id}`) {
        // const deleteResult = await this.repo.deleteById(id);
        // if (deleteResult === false) {
        //   return false;
        // }
        this.cache.splice(
          i,
          1,
        );
        CacheWriteBuffer.push({
          eid: id,
          type: 'remove',
          repo: this.repo as
            | FSDBRepositoryPrototype<FSDBEntity>
            | MongoDBRepositoryPrototype<Entity, IEntity>,
          entity: JSON.stringify(this.cache[i]),
          onError: async (error, type, dbEntity) => {
            this.cache.push(dbEntity as T | K);
            if (onError) {
              await onError();
            }
          },
          async onSuccess(): Promise<void> {
            if (onSuccess) {
              await onSuccess();
            }
          },
        });
        return true;
      }
    }
    console.error(`Cache Entity with ID "${id}" does not exist.`);
    return false;
  }
}
