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

export class MediaCacheHandler extends CacheHandler<FSMedia,
  Media,
  IMedia,
  FSMediaRepository,
  MongoMediaRepository> {
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
    await this.checkCountLatch();
    return this.cache.filter((e) => e.isInRoot === isInRoot);
  }

  async findAllByParentIdDepth1(
    parentId: string,
  ): Promise<Array<Media | FSMedia>> {
    await this.checkCountLatch();
    return this.cache.filter((e) => e.parentId === parentId);
  }

  async findAllByPath(path: string): Promise<Array<Media | FSMedia>> {
    await this.checkCountLatch();
    return this.cache.filter((e) => e.path === path);
  }

  async findAllByContainingPath(path: string): Promise<Array<Media | FSMedia>> {
    await this.checkCountLatch();
    return this.cache.filter((e) => e.path.startsWith(path));
  }

  async findByPath(path: string): Promise<Media | FSMedia> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.path === path);
  }

  async findByNameAndPath(
    name: string,
    path: string,
  ): Promise<Media | FSMedia> {
    await this.checkCountLatch();
    return this.cache.find((e) => e.name === name && e.path === path);
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
