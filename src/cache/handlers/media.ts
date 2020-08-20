import { CacheHandler } from '../handler';
import { FSMedia, Media, IMedia, MediaRepo } from '../../media';

export class MediaCacheHandler extends CacheHandler<FSMedia, Media, IMedia> {
  constructor() {
    super(MediaRepo, [
      'findAllByIsInRoot',
      'findAllByPath',
      'findByPath',
      'findByNameAndPath',
    ]);
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
}
