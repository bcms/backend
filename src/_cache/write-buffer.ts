import {
  Entity,
  FSDBEntity,
  FSDBRepositoryPrototype,
  IEntity,
  Logger,
  MongoDBRepositoryPrototype,
} from '@becomes/purple-cheetah';

export interface CacheWriteBufferObject {
  eid: string;
  /** Stringified object */
  entity: string;
  repo:
    | FSDBRepositoryPrototype<FSDBEntity>
    | MongoDBRepositoryPrototype<Entity, IEntity>;
  type: 'add' | 'update' | 'remove';

  onError(
    error: Error,
    type: 'add' | 'update' | 'remove',
    dbEntry?: FSDBEntity | Entity,
  ): Promise<void>;

  onSuccess(): Promise<void>;
}

export class CacheWriteBuffer {
  private static readonly logger = new Logger('CacheWriteBuffer');
  private static buffer: CacheWriteBufferObject[] = [];
  private static pushing = false;

  private static async watcherHandler() {
    if (this.pushing === false) {
      this.pushing = true;
      if (this.buffer.length > 0) {
        while (this.buffer.length > 0) {
          const obj = this.buffer.pop();
          switch (obj.type) {
            case 'add': {
              const addResult = await obj.repo.add(JSON.parse(obj.entity));
              if (!addResult) {
                obj.onError(
                  Error('Add error.'),
                  obj.type,
                ).catch((error) => {
                  this.logger.error(
                    obj.eid,
                    {
                      message:
                        'Critical nested error. Failed in "onError" handler.',
                      obj: {
                        entity: obj.entity,
                        type: obj.type,
                      },
                      catchError: error,
                    },
                  );
                });
              } else {
                obj.onSuccess().catch(error => {
                  this.logger.error(
                    obj.eid,
                    {
                      message:
                        'Failed in "onSuccess" handler.',
                      obj: {
                        entity: obj.entity,
                        type: obj.type,
                      },
                      catchError: error,
                    },
                  );
                });
              }
            }
              break;
            case 'update': {
              const updateResult = await obj.repo.update(
                JSON.parse(obj.entity),
              );
              if (!updateResult) {
                const dbEntity = await obj.repo.findById(obj.eid);
                obj
                  .onError(
                    Error('Update error.'),
                    obj.type,
                    dbEntity,
                  )
                  .catch((error) => {
                    this.logger.error(
                      obj.eid,
                      {
                        message:
                          'Critical nested error. Failed in "onError" handler.',
                        obj: {
                          entity: obj.entity,
                          type: obj.type,
                        },
                        catchError: error,
                      },
                    );
                  });
              } else {
                obj.onSuccess().catch(error => {
                  this.logger.error(
                    obj.eid,
                    {
                      message:
                        'Failed in "onSuccess" handler.',
                      obj: {
                        entity: obj.entity,
                        type: obj.type,
                      },
                      catchError: error,
                    },
                  );
                });
              }
            }
              break;
            case 'remove': {
              const deleteResult = await obj.repo.deleteById(obj.eid);
              if (!deleteResult) {
                const dbEntity = await obj.repo.findById(obj.eid);
                obj
                  .onError(
                    Error('Remove error.'),
                    obj.type,
                    dbEntity,
                  )
                  .catch((error) => {
                    this.logger.error(
                      obj.eid,
                      {
                        message:
                          'Critical nested error. Failed in "onError" handler.',
                        obj: {
                          entity: obj.entity,
                          type: obj.type,
                        },
                        catchError: error,
                      },
                    );
                  });
              } else {
                obj.onSuccess().catch(error => {
                  this.logger.error(
                    obj.eid,
                    {
                      message:
                        'Failed in "onSuccess" handler.',
                      obj: {
                        entity: obj.entity,
                        type: obj.type,
                      },
                      catchError: error,
                    },
                  );
                });
              }
            }
              break;
          }
        }
      }
      this.pushing = false;
    }
  }

  static init() {
    setInterval(
      async () => {
        await this.watcherHandler();
      },
      100,
    );
  }

  static push(obj: CacheWriteBufferObject) {
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i].eid === obj.eid) {
        this.buffer[i] = obj;
        return;
      }
    }
    this.buffer.push(obj);
  }
}
