import { CacheHandler } from '../handler';
import {
  FSMedia,
  Media,
  IMedia,
  MediaRepo,
  FSMediaRepository,
  MongoMediaRepository,
} from '../../media';
import { Logger } from '@becomes/purple-cheetah';

export class MediaCacheHandler extends CacheHandler<
  FSMedia,
  Media,
  IMedia,
  FSMediaRepository,
  MongoMediaRepository
> {
  constructor() {
    super(
      MediaRepo,
      [
        'findAllByIsInRoot',
        'findAllByPath',
        'findAllByParentId',
        'findAllByContainingPath',
        'findByPath',
        'findByNameAndPath',
        'count',
      ],
      new Logger('MediaCacheHandler'),
    );
  }

  async count(): Promise<number> {
    await this.queueable.exec('count', 'first_done_free_all', async () => {
      await this.checkCountLatch();
      return true;
    });
    return this.cache.length;
  }

  async findAllByIsInRoot(isInRoot: boolean): Promise<Array<Media | FSMedia>> {
    return (await this.queueable.exec(
      'findAllByIsInRoot',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) => e.isInRoot === isInRoot);
      },
    )) as Array<Media | FSMedia>;
  }

  async findAllByParentIdDepth1(
    parentId: string,
  ): Promise<Array<Media | FSMedia>> {
    return (await this.queueable.exec(
      'findAllByParentId',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) => e.parentId === parentId);
      },
    )) as Array<Media | FSMedia>;
  }

  async findAllByPath(path: string): Promise<Array<Media | FSMedia>> {
    return (await this.queueable.exec(
      'findAllByPath',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) => e.path === path);
      },
    )) as Array<Media | FSMedia>;
  }

  async findAllByContainingPath(path: string): Promise<Array<Media | FSMedia>> {
    return (await this.queueable.exec(
      'findAllByContainingPath',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.filter((e) => e.path.startsWith(path));
      },
    )) as Array<Media | FSMedia>;
  }

  async findByPath(path: string): Promise<Media | FSMedia> {
    return (await this.queueable.exec(
      'findByPath',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.path === path);
      },
    )) as Media | FSMedia;
  }

  async findByNameAndPath(
    name: string,
    path: string,
  ): Promise<Media | FSMedia> {
    return (await this.queueable.exec(
      'findByNameAndPath',
      'free_one_by_one',
      async () => {
        await this.checkCountLatch();
        return this.cache.find((e) => e.name === name && e.path === path);
      },
    )) as Media | FSMedia;
  }

  async findByNameAndParentId(
    name: string,
    parentId: string,
  ): Promise<Media | FSMedia> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.name === name && e.parentId === parentId);
  }

  async findByIdInRootAndName(
    isInRoot: boolean,
    name: string,
  ): Promise<Media | FSMedia> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.name === name && e.isInRoot === isInRoot);
  }
}
